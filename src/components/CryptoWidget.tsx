'use client';
import React from 'react';
import Image from 'next/image';
import { useCryptoData } from '@/hooks/useMarketData';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface CryptoItem {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  change24h: number;
}

interface CryptoWidgetProps {
  router: AppRouterInstance;
}

export function CryptoWidget({ router }: CryptoWidgetProps) {
  const { data: cryptoData, isLoading, error } = useCryptoData();

  if (isLoading) {
    return (
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="text-red-400 text-center">
          <Activity className="w-8 h-8 mx-auto mb-2" />
          <p>Failed to load crypto data</p>
        </div>
      </div>
    );
  }

  const handleCryptoClick = (cryptoId: string) => {
    router.push(`/crypto/${cryptoId}`);
  };

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Activity className="w-5 h-5 text-orange-400" />
        <h3 className="text-lg font-semibold text-white">Top Cryptocurrencies</h3>
      </div>
      
      <div className="space-y-4">
        {cryptoData?.slice(0, 8).map((crypto: CryptoItem, index: number) => (
          <motion.div
            key={crypto.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-700/20 hover:bg-gray-700/40 transition-colors cursor-pointer"
            onClick={() => handleCryptoClick(crypto.symbol.toLowerCase())}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <Image 
                  src={crypto.image} 
                  alt={crypto.name}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  // Removed unoptimized - let custom loader handle it
                />
              </div>
              <div>
                <div className="font-medium text-white hover:text-blue-300 transition-colors">
                  {crypto.symbol}
                </div>
                <div className="text-xs text-gray-400">{crypto.name}</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-semibold text-white">
                ${crypto.price.toLocaleString()}
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {crypto.change24h >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{Math.abs(crypto.change24h).toFixed(2)}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}