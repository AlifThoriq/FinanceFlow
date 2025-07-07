import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

// Types for API responses
interface FMPQuote {
  symbol: string;
  name?: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearLow: number;
  yearHigh: number;
  marketCap: number;
  volume: number;
  avgVolume: number;
  pe: number;
  eps: number;
  sharesOutstanding: number;
  previousClose: number;
  open: number;
  exchange: string;
  isEtfOrFund: boolean;
}

interface FMPProfile {
  companyName: string;
  mktCap: number;
  volAvg: number;
  sector: string;
  industry: string;
  country: string;
  website: string;
  description: string;
  ceo: string;
  fullTimeEmployees: number;
  exchangeShortName: string;
  currency: string;
  beta: number;
}

interface FMPMetrics {
  peRatio: number;
  netIncomePerShare: number;
  pfcfRatio: number;
  pocfratio: number;
  dividendYield: number;
  pbRatio: number;
  psRatio: number;
  roe: number;
  roa: number;
  debtToEquity: number;
}

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

// Add rate limiting with simple in-memory cache
const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const lastRequestTime = new Map<string, number>();
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests for FMP

async function rateLimitedRequest(url: string, params: Record<string, string>) {
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
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 429) {
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const apiKey = process.env.FMP_API_KEY;

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'FMP API key not configured' }, { status: 500 });
    }

    const upperSymbol = symbol.toUpperCase();
    console.log(`Fetching stock detail for ${upperSymbol} from FMP`);

    try {
      // Get stock quote (current price and basic info)
      const quoteUrl = `https://financialmodelingprep.com/api/v3/quote/${upperSymbol}`;
      const quoteData = await rateLimitedRequest(quoteUrl, { apikey: apiKey }) as FMPQuote[];

      if (!quoteData || !Array.isArray(quoteData) || quoteData.length === 0) {
        return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
      }

      const quote = quoteData[0];

      // Get company profile for additional details
      let profile: FMPProfile | null = null;
      try {
        const profileUrl = `https://financialmodelingprep.com/api/v3/profile/${upperSymbol}`;
        const profileData = await rateLimitedRequest(profileUrl, { apikey: apiKey }) as FMPProfile[];
        if (profileData && Array.isArray(profileData) && profileData.length > 0) {
          profile = profileData[0];
        }
      } catch (profileError) {
        console.log('Profile data not available:', profileError);
      }

      // Get key metrics for additional financial data
      let metrics: FMPMetrics | null = null;
      try {
        const metricsUrl = `https://financialmodelingprep.com/api/v3/key-metrics/${upperSymbol}`;
        const metricsData = await rateLimitedRequest(metricsUrl, { apikey: apiKey }) as FMPMetrics[];
        if (metricsData && Array.isArray(metricsData) && metricsData.length > 0) {
          metrics = metricsData[0];
        }
      } catch (metricsError) {
        console.log('Metrics data not available:', metricsError);
      }

      // Format the stock detail response
      const stockDetail = {
        symbol: quote.symbol,
        name: profile?.companyName || quote.name || upperSymbol,
        price: quote.price || 0,
        change24h: quote.changesPercentage || 0,
        change: quote.change || 0,
        dayLow: quote.dayLow || quote.price,
        dayHigh: quote.dayHigh || quote.price,
        yearLow: quote.yearLow || quote.price,
        yearHigh: quote.yearHigh || quote.price,
        marketCap: quote.marketCap || profile?.mktCap || 0,
        volume: quote.volume || 0,
        avgVolume: quote.avgVolume || quote.volume,
        pe: quote.pe || metrics?.peRatio || null,
        eps: quote.eps || metrics?.netIncomePerShare || null,
        sharesOutstanding: quote.sharesOutstanding || profile?.volAvg || 0,
        previousClose: quote.previousClose || quote.price,
        open: quote.open || quote.price,
        // Additional profile data if available
        sector: profile?.sector || 'N/A',
        industry: profile?.industry || 'N/A',
        country: profile?.country || 'N/A',
        website: profile?.website || null,
        description: profile?.description || null,
        ceo: profile?.ceo || null,
        employees: profile?.fullTimeEmployees || null,
        exchange: quote.exchange || profile?.exchangeShortName || 'NASDAQ',
        currency: profile?.currency || 'USD',
        // Timestamps
        lastUpdate: new Date().toISOString(),
        marketOpen: !quote.isEtfOrFund,
        isETF: quote.isEtfOrFund || false,
        // Technical indicators
        fiftyDayAverage: metrics?.pfcfRatio || null,
        twoHundredDayAverage: metrics?.pocfratio || null,
        beta: profile?.beta || null,
        dividendYield: metrics?.dividendYield || null,
        // Ratios
        priceToBook: metrics?.pbRatio || null,
        priceToSales: metrics?.psRatio || null,
        returnOnEquity: metrics?.roe || null,
        returnOnAssets: metrics?.roa || null,
        debtToEquity: metrics?.debtToEquity || null
      };

      console.log(`Successfully fetched detail for ${upperSymbol}`);
      return NextResponse.json(stockDetail);

    } catch (apiError) {
      const axiosError = apiError as AxiosError;
      console.error('FMP API Error:', axiosError.response?.data || axiosError.message);
      
      // Handle specific error cases
      if (axiosError.response?.status === 429) {
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
      
      if (axiosError.response?.status === 401) {
        return NextResponse.json({ 
          error: 'Invalid API key for Financial Modeling Prep',
          suggestion: 'Please check your FMP_API_KEY in environment variables'
        }, { status: 401 });
      }
      
      if (axiosError.response?.status === 404) {
        return NextResponse.json({ 
          error: 'Stock not found on FMP',
          symbol: upperSymbol,
          suggestion: 'Please verify the stock symbol'
        }, { status: 404 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to fetch stock data from FMP API',
        details: axiosError.response?.data || axiosError.message,
        status: axiosError.response?.status,
        symbol: upperSymbol,
        source: 'FMP'
      }, { status: 500 });
    }

  } catch (error) {
    const genericError = error as Error;
    console.error('Error fetching stock detail:', genericError);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: genericError.message 
    }, { status: 500 });
  }
}