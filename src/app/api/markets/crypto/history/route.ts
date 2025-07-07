import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

interface PriceData {
  date: string;
  close?: number;
  price?: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}

interface ProcessedChartData {
  timestamp: number;
  date: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timeFormat: string;
  fullDate: string;
}

interface HistoricalPriceResponse {
  historical: PriceData[];
}

// Add rate limiting with simple in-memory cache
const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const lastRequestTime = new Map<string, number>();
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests for FMP

async function rateLimitedRequest(url: string, params: Record<string, string | number>) {
  const cacheKey = `${url}-${JSON.stringify(params)}`;
  const now = Date.now();
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    console.log('Returning cached data');
    return cached.data;
  }
  
  // Rate limiting - wait if last request was too recent
  const lastRequest = lastRequestTime.get('fmp') || 0;
  const timeSinceLastRequest = now - lastRequest;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`Rate limiting: waiting ${waitTime}ms`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  try {
    lastRequestTime.set('fmp', Date.now());
    const response = await axios.get(url, { params });
    
    // Cache the result
    cache.set(cacheKey, {
      data: response.data,
      timestamp: now
    });
    
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      console.log('Rate limit hit, waiting 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      // Retry once after waiting
      lastRequestTime.set('fmp', Date.now());
      const retryResponse = await axios.get(url, { params });
      const retryCacheKey = `${url}-${JSON.stringify(params)}`;
      cache.set(retryCacheKey, {
        data: retryResponse.data,
        timestamp: Date.now()
      });
      return retryResponse.data;
    }
    throw error;
  }
}

// Function to convert CoinGecko crypto ID to FMP symbol
function convertToFMPSymbol(coinGeckoId: string): string {
  const symbolMap: { [key: string]: string } = {
    'bitcoin': 'BTCUSD',
    'ethereum': 'ETHUSD',
    'tether': 'USDTUSD',
    'binancecoin': 'BNBUSD',
    'solana': 'SOLUSD',
    'usd-coin': 'USDCUSD',
    'staked-ether': 'STETH', 
    'xrp': 'XRPUSD',
    'dogecoin': 'DOGEUSD',
    'tron': 'TRXUSD',
    'cardano': 'ADAUSD',
    'avalanche-2': 'AVAXUSD',
    'chainlink': 'LINKUSD',
    'bitcoin-cash': 'BCHUSD',
    'polkadot': 'DOTUSD',
    'polygon': 'MATICUSD',
    'litecoin': 'LTCUSD',
    'internet-computer': 'ICPUSD',
    'ethereum-classic': 'ETCUSD',
    'stellar': 'XLMUSD',
    'crypto-com-chain': 'CROUSD',
    'uniswap': 'UNIUSD',
    'monero': 'XMRUSD',
    'okb': 'OKBUSD',
    'cosmos': 'ATOMUSD',
    'filecoin': 'FILUSD',
    'hedera-hashgraph': 'HBARUSD',
    'vechain': 'VETUSD',
    'theta-token': 'THETAUSD',
    'algorand': 'ALGOUSD'
  };
  
  return symbolMap[coinGeckoId] || `${coinGeckoId.toUpperCase()}USD`;
}

// Helper function to create UTCTimestamp for lightweight-charts v5
function createUTCTimestamp(dateString: string, isIntraday = false): number {
  let date: Date;
  
  if (isIntraday) {
    // For intraday data, handle format: "2024-01-01 15:30:00"
    date = new Date(dateString.replace(' ', 'T') + 'Z');
  } else {
    // For daily data, handle format: "2024-01-01"
    date = new Date(dateString + 'T00:00:00Z');
  }
  
  // Validate date
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date: ${dateString}`);
    return Math.floor(Date.now() / 1000);
  }
  
  // Return UTC timestamp in seconds (required by lightweight-charts v5)
  return Math.floor(date.getTime() / 1000);
}

// Helper function to fetch intraday data with extended range
async function fetchIntradayData(fmpSymbol: string, apiKey: string): Promise<PriceData[]> {
  console.log(`Fetching extended intraday data for ${fmpSymbol}`);
  
  // Try different endpoints with longer ranges
  const endpoints = [
    `/historical-chart/1hour/${fmpSymbol}`, // Gets more historical hours
    `/historical-chart/4hour/${fmpSymbol}`, // 4-hour intervals for more range
    `/historical-chart/30min/${fmpSymbol}`, // 30-min intervals
    `/historical-chart/15min/${fmpSymbol}`, // 15-min intervals
    `/historical-chart/5min/${fmpSymbol}`   // 5-min intervals (fallback)
  ];
  
  for (const endpoint of endpoints) {
    try {
      const url = `https://financialmodelingprep.com/api/v3${endpoint}`;
      console.log(`Trying intraday endpoint: ${url}`);
      
      const response = await rateLimitedRequest(url, { apikey: apiKey });
      
      if (response && Array.isArray(response) && response.length > 0) {
        // Instead of filtering to 24 hours, get last 3-7 days for better chart visualization
        const now = new Date();
        const daysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days back
        
        const filteredData = (response as PriceData[])
          .filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= daysAgo && itemDate <= now;
          })
          .slice(0, 200); // Increase limit for more data points
        
        // If we have good data, return it, otherwise try more
        if (filteredData.length > 20) {
          return filteredData;
        }
        
        // If filtered data is too small, return more recent data
        return (response as PriceData[]).slice(0, 100);
      }
    } catch (error: unknown) {
      console.log(`Intraday endpoint ${endpoint} failed:`, error instanceof Error ? error.message : 'Unknown error');
      continue;
    }
  }
  
  throw new Error('All intraday endpoints failed');
}

// Helper function to fetch EOD data with extended range
async function fetchEODData(fmpSymbol: string, apiKey: string, days: number): Promise<PriceData[]> {
  console.log(`Fetching extended EOD data for ${fmpSymbol}, requested: ${days} days`);
  
  // Multiply the requested days to get more historical data
  const extendedDays = Math.max(days * 3, 90); // At least 3x the requested period, minimum 90 days
  
  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - extendedDays);
  
  const fromDate = startDate.toISOString().split('T')[0];
  const toDate = endDate.toISOString().split('T')[0];

  const params = {
    from: fromDate,
    to: toDate,
    apikey: apiKey
  };

  // Try historical-price-full endpoint first
  try {
    const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${fmpSymbol}`;
    console.log(`Trying EOD endpoint: ${url} (${extendedDays} days)`);
    
    const response = await rateLimitedRequest(url, params);
    
    if ((response as HistoricalPriceResponse)?.historical && Array.isArray((response as HistoricalPriceResponse).historical)) {
      console.log(`Retrieved ${(response as HistoricalPriceResponse).historical.length} historical data points`);
      return (response as HistoricalPriceResponse).historical;
    }
  } catch (error: unknown) {
    console.log('Historical-price-full failed:', error instanceof Error ? error.message : 'Unknown error');
  }

  // Fallback to historical-chart/1day
  try {
    const fallbackUrl = `https://financialmodelingprep.com/api/v3/historical-chart/1day/${fmpSymbol}`;
    console.log(`Trying fallback EOD endpoint: ${fallbackUrl}`);
    
    const fallbackResponse = await rateLimitedRequest(fallbackUrl, { apikey: apiKey });
    
    if (Array.isArray(fallbackResponse) && fallbackResponse.length > 0) {
      // Don't filter by date range for fallback - get as much as possible
      console.log(`Retrieved ${fallbackResponse.length} fallback data points`);
      return (fallbackResponse as PriceData[]).slice(0, 365); // Get up to 1 year of data
    }
  } catch (error: unknown) {
    console.log('Fallback EOD endpoint failed:', error instanceof Error ? error.message : 'Unknown error');
  }
  
  throw new Error('All EOD endpoints failed');
}

// Helper function to process data with smart sampling
function processChartData(rawData: PriceData[], days: number, isIntraday = false): ProcessedChartData[] {
  const validData = rawData
    .filter(item => {
      // Validate required fields
      const hasDate = item.date && typeof item.date === 'string';
      const hasPrice = (item.close || item.price) && !isNaN(Number(item.close || item.price));
      return hasDate && hasPrice;
    })
    .map(item => {
      const timestamp = createUTCTimestamp(item.date, isIntraday);
      const price = Number(item.close || item.price || 0);
      const open = Number(item.open || price);
      const high = Number(item.high || price);
      const low = Number(item.low || price);
      const volume = Number(item.volume || 0);
      
      return {
        timestamp,
        date: item.date,
        price,
        open,
        high,
        low,
        close: price,
        volume,
        // For display
        timeFormat: isIntraday 
          ? new Date(item.date).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            })
          : new Date(item.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }),
        fullDate: new Date(item.date).toLocaleString('en-US')
      };
    })
    .filter(item => item.timestamp > 0) // Remove invalid timestamps
    .sort((a, b) => a.timestamp - b.timestamp); // Sort ascending by timestamp

  // Smart sampling based on timeframe
  let maxDataPoints: number;
  if (isIntraday) {
    maxDataPoints = 200; // More points for intraday
  } else {
    switch (days) {
      case 1:
        maxDataPoints = 100;
        break;
      case 7:
        maxDataPoints = 150;
        break;
      case 30:
        maxDataPoints = 200;
        break;
      case 90:
        maxDataPoints = 250;
        break;
      default:
        maxDataPoints = 300;
    }
  }

  // If we have too much data, sample it intelligently
  if (validData.length > maxDataPoints) {
    const step = Math.ceil(validData.length / maxDataPoints);
    const sampledData = validData.filter((_, index) => index % step === 0);
    console.log(`Sampled ${sampledData.length} points from ${validData.length} total points`);
    return sampledData;
  }

  console.log(`Returning ${validData.length} data points (no sampling needed)`);
  return validData;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const days = parseInt(searchParams.get('days') || '7');
    const apiKey = process.env.FMP_API_KEY;

    if (!id) {
      return NextResponse.json({ error: 'Crypto ID is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'FMP API key not configured' }, { status: 500 });
    }

    try {
      // Convert CoinGecko ID to FMP symbol
      const fmpSymbol = convertToFMPSymbol(id);
      console.log(`Fetching extended ${days} days of data for ${id} (${fmpSymbol}) from FMP`);
      
      let rawData: PriceData[] = [];
      let isIntraday = false;
      let dataSource = '';

      // Determine which endpoint to use based on timeframe
      if (days === 1) {
        // Use intraday data for 1D but with extended range
        isIntraday = true;
        dataSource = 'FMP Extended Intraday';
        rawData = await fetchIntradayData(fmpSymbol, apiKey);
      } else {
        // Use EOD data with extended range for 1W, 1M, 3M
        dataSource = 'FMP Extended EOD';
        rawData = await fetchEODData(fmpSymbol, apiKey, days);
      }
      
      if (!rawData || rawData.length === 0) {
        return NextResponse.json({ 
          error: 'No price data available',
          id,
          fmpSymbol,
          days,
          isIntraday,
          suggestion: 'Try with a popular cryptocurrency like bitcoin, ethereum, or solana'
        }, { status: 404 });
      }

      console.log(`Retrieved ${rawData.length} raw data points from ${dataSource}`);

      // Process data for lightweight-charts v5 with smart sampling
      const chartData = processChartData(rawData, days, isIntraday);

      if (chartData.length === 0) {
        return NextResponse.json({ 
          error: 'No valid chart data after processing',
          id,
          fmpSymbol,
          days,
          rawDataCount: rawData.length
        }, { status: 404 });
      }

      // Calculate statistics
      const priceValues = chartData.map(d => d.price);
      const minPrice = Math.min(...priceValues);
      const maxPrice = Math.max(...priceValues);
      const avgPrice = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;
      
      // Calculate date range of actual data
      const oldestData = chartData[0];
      const newestData = chartData[chartData.length - 1];
      const actualDays = Math.ceil((newestData.timestamp - oldestData.timestamp) / (24 * 60 * 60));
      
      // Check if data was cached
      const cacheKey = isIntraday 
        ? `https://financialmodelingprep.com/api/v3/historical-chart/1hour/${fmpSymbol}-${JSON.stringify({ apikey: apiKey })}`
        : `https://financialmodelingprep.com/api/v3/historical-price-full/${fmpSymbol}-${JSON.stringify({ apikey: apiKey })}`;
      const isCached = cache.has(cacheKey);
      
      const responseData = {
        data: chartData,
        stats: {
          min: Number(minPrice.toFixed(minPrice < 1 ? 6 : 2)),
          max: Number(maxPrice.toFixed(maxPrice < 1 ? 6 : 2)),
          avg: Number(avgPrice.toFixed(avgPrice < 1 ? 6 : 2)),
          count: chartData.length,
          originalCount: rawData.length,
          actualDaysRange: actualDays,
          requestedDays: days,
          interval: isIntraday ? 'hourly/intraday' : 'daily',
          timeframe: days === 1 ? '1 day (extended)' : days === 7 ? '1 week (extended)' : days === 30 ? '1 month (extended)' : '3 months (extended)',
          cached: isCached,
          source: dataSource,
          symbol: fmpSymbol,
          isIntraday,
          dateRange: {
            from: oldestData.fullDate,
            to: newestData.fullDate
          }
        }
      };

      console.log(`Processed ${chartData.length} chart data points spanning ${actualDays} days for lightweight-charts v5`);
      return NextResponse.json(responseData);

    } catch (apiError: unknown) {
      console.error('FMP API Error:', axios.isAxiosError(apiError) ? apiError.response?.data || apiError.message : apiError);
      
      // Handle specific error cases
      if (axios.isAxiosError(apiError) && apiError.response?.status === 429) {
        return NextResponse.json({ 
          error: 'Rate limit exceeded. Please try again in a few moments.',
          retryAfter: 60,
          source: 'FMP'
        }, { 
          status: 429,
          headers: {
            'Retry-After': '60'
          }
        });
      }
      
      if (axios.isAxiosError(apiError) && apiError.response?.status === 401) {
        return NextResponse.json({ 
          error: 'Invalid API key for Financial Modeling Prep',
          suggestion: 'Please check your FMP_API_KEY in environment variables'
        }, { status: 401 });
      }
      
      if (axios.isAxiosError(apiError) && apiError.response?.status === 404) {
        return NextResponse.json({ 
          error: 'Cryptocurrency not found on FMP',
          id,
          suggestion: 'Try with a popular cryptocurrency symbol'
        }, { status: 404 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to fetch data from FMP API',
        details: axios.isAxiosError(apiError) ? apiError.response?.data || apiError.message : 'Unknown error',
        status: axios.isAxiosError(apiError) ? apiError.response?.status : 500,
        id,
        days,
        source: 'FMP'
      }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error('Error fetching crypto history:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
