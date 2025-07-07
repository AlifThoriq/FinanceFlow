'use client';
import React from 'react';
import { useEconomicData } from '@/hooks/useMarketData';
import { BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface EconomicIndicator {
  seriesId: string;
  indicator: string;
  value: number;
}

export function EconomicIndicators() {
  const { data: economicData, isLoading } = useEconomicData();

  if (isLoading) {
    return (
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-700 rounded w-32"></div>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getIndicatorColor = (indicator: string, value: number) => {
    switch (indicator.toLowerCase()) {
      case 'unemployment rate':
        return value < 5 ? 'text-green-400' : 'text-red-400';
      case 'consumer price index':
        return value < 3 ? 'text-green-400' : 'text-red-400';
      case 'gross domestic product':
        return value > 2 ? 'text-green-400' : 'text-yellow-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div className="flex items-center space-x-2 mb-6">
        <BarChart3 className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Economic Indicators</h3>
      </div>
      
      <div className="space-y-4">
        {economicData?.map((indicator: EconomicIndicator, index: number) => (
          <motion.div
            key={indicator.seriesId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-700/20"
          >
            <div className="text-gray-300">{indicator.indicator}</div>
            <div className={`font-semibold ${getIndicatorColor(indicator.indicator, indicator.value)}`}>
              {indicator.value}%
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          Data from Federal Reserve Economic Data (FRED)
        </div>
      </div>
    </div>
  );
}