'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Globe,
  ExternalLink,
  RefreshCw,
  Activity,
  TrendingUpDown,
  Building,
  Users,
  MapPin,
  Briefcase
} from 'lucide-react';
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi,
  LineData,
  CandlestickData,
  UTCTimestamp,
  LineSeries,
  CandlestickSeries
} from 'lightweight-charts';

interface StockDetail {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearLow: number;
  yearHigh: number;
  marketCap: number;
  volume: number;
  avgVolume: number;
  pe: number | null;
  eps: number | null;
  sharesOutstanding: number;
  previousClose: number;
  open: number;
  sector: string;
  industry: string;
  country: string;
  website: string | null;
  description: string | null;
  ceo: string | null;
  employees: number | null;
  exchange: string;
  currency: string;
  lastUpdate: string;
  marketOpen: boolean;
  isETF: boolean;
  fiftyDayAverage: number | null;
  twoHundredDayAverage: number | null;
  beta: number | null;
  dividendYield: number | null;
  priceToBook: number | null;
  priceToSales: number | null;
  returnOnEquity: number | null;
  returnOnAssets: number | null;
  debtToEquity: number | null;
}

interface ChartDataPoint {
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

interface ChartResponse {
  data: ChartDataPoint[];
  stats: {
    min: number;
    max: number;
    avg: number;
    count: number;
    originalCount: number;
    actualDaysRange: number;
    requestedDays: number;
    interval: string;
    timeframe: string;
    cached: boolean;
    source: string;
    symbol: string;
    isIntraday: boolean;
    dateRange: {
      from: string;
      to: string;
    };
  };
}

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = params.symbol as string;
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');
  const [timeframe, setTimeframe] = useState<'1' | '7' | '30' | '90'>('7');
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | ISeriesApi<'Candlestick'> | null>(null);

  // Fetch stock detail
  const { data: stockDetail, isLoading: stockLoading, refetch: refetchStock } = useQuery({
    queryKey: ['stock-detail', symbol],
    queryFn: async () => {
      const response = await fetch(`/api/markets/stocks/detail?symbol=${symbol.toUpperCase()}`);
      if (!response.ok) throw new Error('Failed to fetch stock data');
      return response.json() as Promise<StockDetail>;
    },
    refetchInterval: 30000,
  });

  // Fetch historical data
  const { data: historicalResponse, isLoading: historyLoading } = useQuery({
    queryKey: ['stock-history', symbol, timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/markets/stocks/history?symbol=${symbol.toUpperCase()}&days=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch historical data');
      return response.json() as Promise<ChartResponse>;
    },
    refetchInterval: 300000, // 5 minutes
    enabled: !!stockDetail?.symbol,
  });

  // Initialize and update chart
  useEffect(() => {
    if (!chartContainerRef.current || !historicalResponse?.data) return;

    // Clear previous chart
    if (chartRef.current) {
      chartRef.current.remove();
    }

    // Create new chart with v5 options
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9CA3AF',
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      rightPriceScale: {
        borderColor: '#374151',
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#6B7280',
          labelBackgroundColor: '#3B82F6',
        },
        horzLine: {
          color: '#6B7280',
          labelBackgroundColor: '#3B82F6',
        },
      },
      handleScroll: true,
      handleScale: true,
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    chartRef.current = chart;

    // Process data - backend already provides proper UTCTimestamp
    const validData = historicalResponse.data
      .filter((point: ChartDataPoint) => 
        typeof point.timestamp === 'number' && 
        !isNaN(point.timestamp) && 
        point.timestamp > 0 &&
        typeof point.price === 'number' && 
        !isNaN(point.price)
      )
      .sort((a: ChartDataPoint, b: ChartDataPoint) => a.timestamp - b.timestamp);

    if (validData.length === 0) {
      console.warn('No valid data points for chart');
      return;
    }

    console.log(`Rendering ${validData.length} data points for ${chartType} chart`);

    // Add series based on chart type using v5 API
    if (chartType === 'line') {
      const lineSeries = chart.addSeries(LineSeries, {
        color: '#10B981',
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: '#10B981',
        crosshairMarkerBackgroundColor: '#10B981',
      });

      // Convert data for line chart - backend timestamp is already in seconds
      const lineData: LineData[] = validData.map((point: ChartDataPoint) => ({
        time: point.timestamp as UTCTimestamp, // Backend provides proper UTCTimestamp
        value: point.price,
      }));

      console.log(`Setting ${lineData.length} line data points`);
      lineSeries.setData(lineData);
      seriesRef.current = lineSeries;

    } else {
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#10B981',
        downColor: '#EF4444',
        borderVisible: false,
        wickUpColor: '#10B981',
        wickDownColor: '#EF4444',
      });

      // Convert data for candlestick chart
      const candlestickData: CandlestickData[] = validData.map((point: ChartDataPoint) => ({
        time: point.timestamp as UTCTimestamp, // Backend provides proper UTCTimestamp
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
      }));

      console.log(`Setting ${candlestickData.length} candlestick data points`);
      candlestickSeries.setData(candlestickData);
      seriesRef.current = candlestickSeries;
    }

    // Fit content to show all data
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: 400,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      seriesRef.current = null;
    };
  }, [historicalResponse, chartType]);

  // Update chart size when container size changes
  useEffect(() => {
    if (chartRef.current && chartContainerRef.current) {
      chartRef.current.applyOptions({
        width: chartContainerRef.current.clientWidth,
        height: 400,
      });
    }
  }, []);

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toLocaleString()}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    return volume.toLocaleString();
  };

  const formatRatio = (ratio: number | null) => {
    if (ratio === null || ratio === undefined) return 'N/A';
    return ratio.toFixed(2);
  };

  const formatPercentage = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(2)}%`;
  };

  if (stockLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-green-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading {symbol?.toUpperCase()} data...</p>
        </div>
      </div>
    );
  }

  if (!stockDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Stock not found</p>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isPositive = stockDetail.change >= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{stockDetail.symbol.slice(0, 2)}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{stockDetail.name}</h1>
                  <p className="text-gray-400 text-sm flex items-center space-x-2">
                    <span>{stockDetail.symbol}</span>
                    <span>•</span>
                    <span>{stockDetail.exchange}</span>
                    {stockDetail.isETF && (
                      <>
                        <span>•</span>
                        <span className="text-blue-400">ETF</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                stockDetail.marketOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  stockDetail.marketOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`} />
                <span>{stockDetail.marketOpen ? 'Market Open' : 'Market Closed'}</span>
              </div>
              <button
                onClick={() => refetchStock()}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Price Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <div>
              <div className="text-4xl font-bold text-white mb-2">
                {formatPrice(stockDetail.price)}
              </div>
              <div className={`flex items-center space-x-3 ${
                isPositive ? 'text-green-400' : 'text-red-400'
              }`}>
                {isPositive ? 
                  <TrendingUp className="w-5 h-5" /> : 
                  <TrendingDown className="w-5 h-5" />
                }
                <span className="text-lg font-semibold">
                  {isPositive ? '+' : ''}{formatPrice(stockDetail.change)}
                </span>
                <span className="text-lg font-semibold">
                  ({isPositive ? '+' : ''}{stockDetail.change24h.toFixed(2)}%)
                </span>
                <span className="text-sm text-gray-400">Today</span>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 text-right">
              <div className="text-sm text-gray-400">Last Updated</div>
              <div className="text-white">
                {new Date(stockDetail.lastUpdate).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Market Cap</div>
              <div className="text-white font-semibold">
                {formatLargeNumber(stockDetail.marketCap)}
              </div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Volume</div>
              <div className="text-white font-semibold">
                {formatVolume(stockDetail.volume)}
              </div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">P/E Ratio</div>
              <div className="text-white font-semibold">
                {formatRatio(stockDetail.pe)}
              </div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">EPS</div>
              <div className="text-white font-semibold">
                {stockDetail.eps ? formatPrice(stockDetail.eps) : 'N/A'}
              </div>
            </div>
          </div>

          {/* Day Range and 52-Week Range */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="text-sm text-blue-400 mb-2">Today&apos;s Range</div>
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">{formatPrice(stockDetail.dayLow)}</span>
                <div className="flex-1 mx-4 h-2 bg-gray-700 rounded-full relative">
                  <div 
                    className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${((stockDetail.price - stockDetail.dayLow) / (stockDetail.dayHigh - stockDetail.dayLow)) * 100}%`
                    }}
                  />
                  <div 
                    className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-blue-500"
                    style={{
                      left: `${((stockDetail.price - stockDetail.dayLow) / (stockDetail.dayHigh - stockDetail.dayLow)) * 100}%`
                    }}
                  />
                </div>
                <span className="text-white font-semibold">{formatPrice(stockDetail.dayHigh)}</span>
              </div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <div className="text-sm text-purple-400 mb-2">52-Week Range</div>
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">{formatPrice(stockDetail.yearLow)}</span>
                <div className="flex-1 mx-4 h-2 bg-gray-700 rounded-full relative">
                  <div 
                    className="absolute top-0 left-0 h-full bg-purple-500 rounded-full"
                    style={{
                      width: `${((stockDetail.price - stockDetail.yearLow) / (stockDetail.yearHigh - stockDetail.yearLow)) * 100}%`
                    }}
                  />
                  <div 
                    className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-purple-500"
                    style={{
                      left: `${((stockDetail.price - stockDetail.yearLow) / (stockDetail.yearHigh - stockDetail.yearLow)) * 100}%`
                    }}
                  />
                </div>
                <span className="text-white font-semibold">{formatPrice(stockDetail.yearHigh)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Price Chart</h3>
                
                <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                  {/* Chart Type Toggle */}
                  <div className="flex bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setChartType('line')}
                      className={`p-2 rounded-md transition-colors ${
                        chartType === 'line' 
                          ? 'bg-green-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <LineChart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setChartType('candlestick')}
                      className={`p-2 rounded-md transition-colors ${
                        chartType === 'candlestick' 
                          ? 'bg-green-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <TrendingUpDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Timeframe Toggle */}
                  <div className="flex bg-gray-700 rounded-lg p-1">
                    {(['1', '7', '30', '90'] as const).map((days) => (
                      <button
                        key={days}
                        onClick={() => setTimeframe(days)}
                        className={`px-3 py-1 rounded-md text-sm transition-colors ${
                          timeframe === days 
                            ? 'bg-green-600 text-white' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {days === '1' ? '1D' : days === '7' ? '1W' : days === '30' ? '1M' : '3M'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chart Container */}
              <div className="h-96 w-full">
                {historyLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="w-6 h-6 text-green-400 animate-spin" />
                  </div>
                ) : historicalResponse && historicalResponse.data && historicalResponse.data.length > 0 ? (
                  <div ref={chartContainerRef} className="w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                      <p>No chart data available</p>
                      <p className="text-sm mt-2">Try selecting a different timeframe</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chart Stats */}
              {historicalResponse?.stats && (
                <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-gray-400">Min</div>
                    <div className="text-white font-semibold">
                      {formatPrice(historicalResponse.stats.min)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Max</div>
                    <div className="text-white font-semibold">
                      {formatPrice(historicalResponse.stats.max)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Avg</div>
                    <div className="text-white font-semibold">
                      {formatPrice(historicalResponse.stats.avg)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Data Points</div>
                    <div className="text-white font-semibold">
                      {historicalResponse.stats.count}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Company Info</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-400">Sector</div>
                    <div className="text-white">{stockDetail.sector}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-400">Industry</div>
                    <div className="text-white">{stockDetail.industry}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-400">Country</div>
                    <div className="text-white">{stockDetail.country}</div>
                  </div>
                </div>
                
                {stockDetail.employees && (
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-400">Employees</div>
                      <div className="text-white">{stockDetail.employees.toLocaleString()}</div>
                    </div>
                  </div>
                )}
                
                {stockDetail.ceo && (
                  <div>
                    <div className="text-sm text-gray-400">CEO</div>
                    <div className="text-white">{stockDetail.ceo}</div>
                  </div>
                )}
                
                {stockDetail.website && (
                  <a 
                    href={stockDetail.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Visit Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </motion.div>

            {/* Financial Metrics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
            >              <h3 className="text-lg font-semibold text-white mb-4">Financial Metrics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Return on Equity</div>
                  <div className="text-white font-semibold">{formatPercentage(stockDetail.returnOnEquity)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Return on Assets</div>
                  <div className="text-white font-semibold">{formatPercentage(stockDetail.returnOnAssets)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Debt to Equity</div>
                  <div className="text-white font-semibold">{formatRatio(stockDetail.debtToEquity)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Beta</div>
                  <div className="text-white font-semibold">{formatRatio(stockDetail.beta)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Dividend Yield</div>
                  <div className="text-white font-semibold">{formatPercentage(stockDetail.dividendYield)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Price to Book</div>
                  <div className="text-white font-semibold">{formatRatio(stockDetail.priceToBook)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Price to Sales</div>
                  <div className="text-white font-semibold">{formatRatio(stockDetail.priceToSales)}</div>
                </div>
                <div>
                  <div className="text-gray-400">50-Day Average</div>
                  <div className="text-white font-semibold">{stockDetail.fiftyDayAverage ? formatPrice(stockDetail.fiftyDayAverage) : 'N/A'}</div>
                </div>
                <div>
                  <div className="text-gray-400">200-Day Average</div>
                  <div className="text-white font-semibold">{stockDetail.twoHundredDayAverage ? formatPrice(stockDetail.twoHundredDayAverage) : 'N/A'}</div>
                </div>
              </div>
            </motion.div>
             </div>
              </div>
               </div>
               {/* Footer */}
                           <footer className="bg-gray-900 border-t border-gray-700 mt-16">
                             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                               <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                 <div className="col-span-1 md:col-span-2">
                                   <div className="flex items-center space-x-2 mb-4">
                                     <Activity className="w-6 h-6 text-blue-400" />
                                     <h3 className="text-lg font-bold text-white">FinanceFlow</h3>
                                   </div>
                                   <p className="text-gray-400 mb-4">
                                     Your comprehensive source for real-time financial data, market insights, and global economic news.
                                   </p>
                                   <div className="flex items-center space-x-4">
                                     <div className="flex items-center space-x-2 text-sm text-gray-400">
                                       <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                       <span>Real-time data</span>
                                     </div>
                                     <div className="flex items-center space-x-2 text-sm text-gray-400">
                                       <Globe className="w-4 h-4" />
                                       <span>Global coverage</span>
                                     </div>
                                   </div>
                                 </div>
                                 
                                 <div>
                                   <h4 className="text-white font-semibold mb-4">Markets</h4>
                                   <ul className="space-y-2 text-gray-400">
                                     <li><a href="#" className="hover:text-white transition-colors">Stock Market</a></li>
                                     <li><a href="#" className="hover:text-white transition-colors">Cryptocurrency</a></li>
                                     <li><a href="#" className="hover:text-white transition-colors">Commodities</a></li>
                                     <li><a href="#" className="hover:text-white transition-colors">Forex</a></li>
                                   </ul>
                                 </div>
                                 
                                 <div>
                                   <h4 className="text-white font-semibold mb-4">Resources</h4>
                                   <ul className="space-y-2 text-gray-400">
                                     <li><a href="#" className="hover:text-white transition-colors">Economic Calendar</a></li>
                                     <li><a href="#" className="hover:text-white transition-colors">Market Analysis</a></li>
                                     <li><a href="#" className="hover:text-white transition-colors">Trading Tools</a></li>
                                     <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                                   </ul>
                                 </div>
                               </div>
                               
                               <div className="border-t border-gray-700 mt-8 pt-6">
                                 <div className="flex flex-col md:flex-row justify-between items-center">
                                   <p className="text-gray-400 text-sm">
                                     &copy; 2024 FinanceFlow. All rights reserved.
                                   </p>
                                   <div className="flex items-center space-x-6 mt-4 md:mt-0">
                                     <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                                     <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
                                     <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</a>
                                   </div>
                                 </div>
                               </div>
                             </div>
                           </footer>
                </div>
  )
}