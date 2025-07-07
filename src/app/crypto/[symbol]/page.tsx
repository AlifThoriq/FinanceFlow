'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
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
  TrendingUpDown
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

interface CryptoDetail {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume: number;
  image: string;
  rank: number;
  supply?: number;
  maxSupply?: number;
  ath?: number;
  atl?: number;
  athDate?: string;
  atlDate?: string;
}

interface NewsItem {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
}

interface ChartDataPoint {
  time: string;
  price: number;
  timestamp: number;
  fullDate: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function CryptoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = params.symbol as string;
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');
  const [timeframe, setTimeframe] = useState<'1' | '7' | '30' | '90'>('7');
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | ISeriesApi<'Candlestick'> | null>(null);

  // Fetch crypto detail
  const { data: cryptoDetail, isLoading: cryptoLoading, refetch: refetchCrypto } = useQuery({
    queryKey: ['crypto-detail', symbol],
    queryFn: async (): Promise<CryptoDetail> => {
      const response = await fetch(`/api/markets/crypto/detail?symbol=${symbol.toLowerCase()}`);
      if (!response.ok) throw new Error('Failed to fetch crypto data');
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Fetch historical data
  const { data: historicalResponse, isLoading: historyLoading } = useQuery({
    queryKey: ['crypto-history', symbol, timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/markets/crypto/history?id=${cryptoDetail?.id}&days=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch historical data');
      return response.json();
    },
    refetchInterval: 300000, // 5 minutes
    enabled: !!cryptoDetail?.id,
  });

  // Fetch related news
  const { data: news, isLoading: newsLoading } = useQuery({
    queryKey: ['crypto-news', symbol],
    queryFn: async (): Promise<NewsItem[]> => {
      const response = await fetch(`/api/news/crypto?symbol=${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch news');
      return response.json();
    },
    refetchInterval: 600000, // 10 minutes
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
      color: '#3B82F6',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      crosshairMarkerBorderColor: '#3B82F6',
      crosshairMarkerBackgroundColor: '#3B82F6',
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
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toLocaleString()}`;
  };

  const formatSupply = (supply: number) => {
    if (supply >= 1e9) return `${(supply / 1e9).toFixed(2)}B`;
    if (supply >= 1e6) return `${(supply / 1e6).toFixed(2)}M`;
    if (supply >= 1e3) return `${(supply / 1e3).toFixed(2)}K`;
    return supply.toLocaleString();
  };

  if (cryptoLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading {symbol?.toUpperCase()} data...</p>
        </div>
      </div>
    );
  }

  if (!cryptoDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Cryptocurrency not found</p>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
                <Image 
                  src={cryptoDetail.image} 
                  alt={cryptoDetail.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div>
                  <h1 className="text-2xl font-bold text-white">{cryptoDetail.name}</h1>
                  <p className="text-gray-400 text-sm flex items-center space-x-2">
                    <span>{cryptoDetail.symbol.toUpperCase()}</span>
                    <span>•</span>
                    <span>Rank #{cryptoDetail.rank}</span>
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => refetchCrypto()}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
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
                {formatPrice(cryptoDetail.price)}
              </div>
              <div className={`flex items-center space-x-2 ${
                cryptoDetail.change24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {cryptoDetail.change24h >= 0 ? 
                  <TrendingUp className="w-5 h-5" /> : 
                  <TrendingDown className="w-5 h-5" />
                }
                <span className="text-lg font-semibold">
                  {cryptoDetail.change24h >= 0 ? '+' : ''}{cryptoDetail.change24h.toFixed(2)}%
                </span>
                <span className="text-sm text-gray-400">24h</span>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 text-right">
              <div className="text-sm text-gray-400">Last Updated</div>
              <div className="text-white">
                {new Date().toLocaleString()}
              </div>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Market Cap</div>
              <div className="text-white font-semibold">
                {formatLargeNumber(cryptoDetail.marketCap)}
              </div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">24h Volume</div>
              <div className="text-white font-semibold">
                {formatLargeNumber(cryptoDetail.volume)}
              </div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Circulating Supply</div>
              <div className="text-white font-semibold">
                {cryptoDetail.supply ? formatSupply(cryptoDetail.supply) : 'N/A'}
              </div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Max Supply</div>
              <div className="text-white font-semibold">
                {cryptoDetail.maxSupply ? formatSupply(cryptoDetail.maxSupply) : '∞'}
              </div>
            </div>
          </div>

          {/* All Time High/Low */}
          {(cryptoDetail.ath || cryptoDetail.atl) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              {cryptoDetail.ath && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="text-sm text-green-400 mb-1">All Time High</div>
                  <div className="text-white font-semibold text-lg">
                    {formatPrice(cryptoDetail.ath)}
                  </div>
                  {cryptoDetail.athDate && (
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(cryptoDetail.athDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
              {cryptoDetail.atl && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="text-sm text-red-400 mb-1">All Time Low</div>
                  <div className="text-white font-semibold text-lg">
                    {formatPrice(cryptoDetail.atl)}
                  </div>
                  {cryptoDetail.atlDate && (
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(cryptoDetail.atlDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
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
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <LineChart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setChartType('candlestick')}
                      className={`p-2 rounded-md transition-colors ${
                        chartType === 'candlestick' 
                          ? 'bg-blue-600 text-white' 
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
                            ? 'bg-blue-600 text-white' 
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
                    <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
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

          {/* News Section */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-6">
                {cryptoDetail.name} News
              </h3>
              
              <div className="space-y-4">
                {newsLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded mb-1"></div>
                      <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                    </div>
                  ))
                ) : news && news.length > 0 ? (
                  news.slice(0, 5).map((article: NewsItem, index: number) => (
                    <div key={index} className="border-b border-gray-700 pb-4 last:border-b-0">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:bg-gray-700/20 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <h4 className="text-white font-medium text-sm mb-2 line-clamp-2 hover:text-blue-300">
                          {article.title}
                        </h4>
                        <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                          {article.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{article.source}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {new Date(article.publishedAt).toLocaleDateString()}
                            </span>
                            <ExternalLink className="w-3 h-3 text-blue-400" />
                          </div>
                        </div>
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm text-center py-8">
                    <Globe className="w-8 h-8 mx-auto mb-4 text-gray-600" />
                    <p>No news available for {cryptoDetail.name}</p>
                    <p className="text-xs mt-2">Check back later for updates</p>
                  </div>
                )}
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
  );
}