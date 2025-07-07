'use client';
import React, { useEffect, useState } from 'react';
import { useMarketData, useCryptoData } from '@/hooks/useMarketData';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface CryptoData {
  symbol: string;
  price: number;
  change24h: number;
}

export function MarketTicker() {
  const { data: stockData } = useMarketData();
  const { data: cryptoData } = useCryptoData();
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    if (stockData && cryptoData) {
      const combined = [
        ...stockData.slice(0, 3),
        ...cryptoData.slice(0, 3).map((crypto: CryptoData) => ({
          symbol: crypto.symbol,
          price: crypto.price,
          change: crypto.change24h,
          changePercent: crypto.change24h
        }))
      ];
      setTickerItems(combined);
    }
  }, [stockData, cryptoData]);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 overflow-hidden">
      <div className="flex animate-scroll whitespace-nowrap py-2">
        {tickerItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 mx-8">
            <span className="font-medium text-white">{item.symbol}</span>
            <span className="text-gray-300">
              ${item.price.toLocaleString()}
            </span>
            <div className={`flex items-center space-x-1 ${
              item.change >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {item.change >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span className="text-sm">
                {item.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}