'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSearch } from '@/hooks/useSearch';
import { 
  Search, 
  TrendingUp, 
  DollarSign, 
  Loader2,
  X
} from 'lucide-react';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({ 
  className = "", 
  placeholder = "Search stocks & crypto..." 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'stocks' | 'crypto'>('all');
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: searchResults, isLoading } = useSearch(query, selectedType);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length >= 2);
  };

  const handleStockClick = (symbol: string) => {
    router.push(`/stock/${symbol}`);
    setQuery('');
    setIsOpen(false);
  };

  const handleCryptoClick = (coinId: string) => {
    router.push(`/crypto/${coinId}`);
    setQuery('');
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const hasResults = searchResults && (searchResults.stocks.length > 0 || searchResults.crypto.length > 0);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {/* Filter Tabs */}
          <div className="flex border-b border-gray-700 p-2">
            {[
              { key: 'all', label: 'All', icon: Search },
              { key: 'stocks', label: 'Stocks', icon: TrendingUp },
              { key: 'crypto', label: 'Crypto', icon: DollarSign }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedType(key as typeof selectedType)}
                className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                  selectedType === key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              <span className="ml-2 text-gray-400">Searching...</span>
            </div>
          )}

          {/* Results */}
          {!isLoading && (
            <>
              {/* Stock Results */}
              {searchResults?.stocks && searchResults.stocks.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-2">
                    Stocks
                  </div>
                  {searchResults.stocks.map((stock, index) => (
                    <button
                      key={`${stock.symbol}-${index}`}
                      onClick={() => handleStockClick(stock.symbol)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {stock.logo ? (
                            <div className="w-8 h-8 rounded-full bg-white p-1 flex items-center justify-center overflow-hidden">
                              <Image
                                src={stock.logo}
                                alt={stock.symbol}
                                width={32}
                                height={32}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/api/placeholder/32/32';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                          )}

                          <div>
                            <div className="font-medium text-white group-hover:text-blue-300">
                              {stock.displaySymbol || stock.symbol}
                            </div>
                            <div className="text-sm text-gray-400 truncate max-w-xs">
                              {stock.description}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 uppercase">
                          {stock.type}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Crypto Results */}
              {searchResults?.crypto && searchResults.crypto.length > 0 && (
                <div className="p-2">
                  {searchResults.stocks.length > 0 && <div className="border-t border-gray-700 my-2"></div>}
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-2">
                    Cryptocurrency
                  </div>
                  {searchResults.crypto.map((crypto) => (
                    <button
                      key={crypto.id}
                      onClick={() => handleCryptoClick(crypto.id)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            <Image
                              src={crypto.image}
                              alt={crypto.name}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/api/placeholder/32/32';
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-medium text-white group-hover:text-blue-300">
                              {crypto.symbol}
                            </div>
                            <div className="text-sm text-gray-400">
                              {crypto.name}
                            </div>
                          </div>
                        </div>
                        {crypto.marketCapRank && (
                          <div className="text-xs text-gray-500">
                            #{crypto.marketCapRank}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {!isLoading && !hasResults && query.length >= 2 && (
                <div className="text-center py-8">
                  <Search className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">
                    No results found for &quot;{query}&quot;
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Try searching for stock symbols or cryptocurrency names
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}