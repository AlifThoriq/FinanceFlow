'use client';
import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MarketTicker } from '@/components/MarketTicker';
import { LiveChart } from '@/components/LiveChart';
import { NewsCard } from '@/components/NewsCard';
import { NewsPagination } from '@/components/NewsPagination';
import { CryptoWidget } from '@/components/CryptoWidget';
import { EconomicIndicators } from '@/components/EconomicIndicators';
import { SearchBar } from '@/components/SearchBar';
import { WalletConnect } from '@/components/WalletConnect';
import { useMarketData, useNewsData } from '@/hooks/useMarketData';
import { 
  Activity, 
  Globe, 
  TrendingUp, 
  Newspaper,
  BarChart3,
  Zap,
  Menu,
  X,
  Bell,
  Settings,
  ChevronUp,
  Calendar,
  DollarSign
} from 'lucide-react';

// Define types for better type safety
interface MarketDataItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
}

interface NewsItem {
  title: string;
  description?: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
  urlToImage?: string;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
    },
  },
});

function Dashboard() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('business');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchTerm] = useState(''); // Keep for potential future use
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // 5 berita per halaman
  
  const { data: marketData, isLoading: marketLoading } = useMarketData();
  const { data: newsData, isLoading: newsLoading } = useNewsData(selectedCategory);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  const categories = [
    { id: 'business', label: 'Business', icon: BarChart3 },
    { id: 'technology', label: 'Technology', icon: Zap },
    { id: 'general', label: 'General', icon: Globe },
    { id: 'health', label: 'Health', icon: Activity },
    { id: 'science', label: 'Science', icon: Settings },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter news based on search term
  const filteredNews = newsData?.filter((news: NewsItem) =>
    news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    news.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalItems = filteredNews?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNews = filteredNews?.slice(startIndex, endIndex) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to news section when page changes
    const newsSection = document.getElementById('news');
    if (newsSection) {
      newsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleStockClick = (symbol: string) => {
    router.push(`/stock/${symbol}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-md border-b border-gray-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-8 h-8 text-blue-400" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  FinanceFlow
                </h1>
              </div>
              <div className="hidden md:flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">Live</span>
              </div>
            </div>

            {/* Center - Global Search Bar (Stocks & Crypto) */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <SearchBar className="w-full" placeholder="Search stocks & crypto..." />
            </div>

            {/* Right side - Time and Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>
              
              <div className="hidden md:flex items-center space-x-2">
                <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden border-t border-gray-700"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Mobile Global Search */}
                <div className="mb-3">
                  <SearchBar className="w-full" placeholder="Search stocks & crypto..." />
                </div>
                
                {['Markets', 'Crypto', 'News', 'Economic Data', 'Wallet'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    className="block px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Market Ticker */}
      <div className="pt-16">
        <MarketTicker />
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
          id="markets"
        >
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
              <div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  Global Financial Intelligence
                </h2>
                <p className="text-xl text-gray-300">
                  Real-time market data, breaking news, and economic insights in one place
                </p>
              </div>
              <div className="mt-4 lg:mt-0 flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <DollarSign className="w-4 h-4" />
                  <span>USD</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Globe className="w-4 h-4" />
                  <span>Global Markets</span>
                </div>
              </div>
            </div>
            
            {/* Market Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {marketLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-xl p-6 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-6 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-20"></div>
                  </div>
                ))
              ) : (
                marketData?.slice(0, 4).map((stock: MarketDataItem, index: number) => (
                  <motion.div
                    key={stock.symbol}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer group"
                    onClick={() => handleStockClick(stock.symbol)}
                  >
                    <div className="text-sm text-gray-400 mb-2 group-hover:text-gray-300">
                      {stock.symbol}
                    </div>
                    <div className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300">
                      ${stock.price.toLocaleString()}
                    </div>
                    <div className={`flex items-center space-x-1 text-sm ${
                      stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <TrendingUp className="w-4 h-4" />
                      <span>{stock.changePercent.toFixed(2)}%</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Vol: {stock.volume?.toLocaleString() || 'N/A'}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.section>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - News */}
          <div className="lg:col-span-2">
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
              id="news"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <Newspaper className="w-6 h-6 text-blue-400" />
                  <h3 className="text-2xl font-bold text-white">Latest News</h3>
                  {searchTerm && (
                    <span className="text-sm text-gray-400">
                      ({totalItems} results)
                    </span>
                  )}
                </div>
                
                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedCategory === category.id
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{category.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* News Grid */}
              <div className="space-y-6">
                {newsLoading ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 animate-pulse">
                      <div className="h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-6 bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded"></div>
                    </div>
                  ))
                ) : currentNews && currentNews.length > 0 ? (
                  currentNews.map((news: NewsItem, index: number) => (
                    <motion.div
                      key={`${currentPage}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <NewsCard news={news} />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Newspaper className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">
                      {searchTerm ? 'No news found matching your search.' : 'No news available.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <NewsPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}
                />
              )}
            </motion.section>
          </div>

          {/* Right Column - Widgets */}
          <div className="space-y-8">
            {/* Live Chart */}
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
              id="live-chart"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Live Market Chart</h3>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-400">Live</span>
                </div>
              </div>
              <LiveChart symbol="SPY" />
            </motion.section>

            {/* Crypto Widget */}
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              id="crypto"
            >
              <CryptoWidget router={router} />
            </motion.section>

            {/* Economic Indicators */}
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              id="economic-data"
            >
              <EconomicIndicators />
            </motion.section>

            {/* Wallet Connect */}
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              id="wallet"
            >
              <WalletConnect />
            </motion.section>
          </div>
        </div>
      </main>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors z-40"
        >
          <ChevronUp className="w-6 h-6" />
        </motion.button>
      )}

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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}