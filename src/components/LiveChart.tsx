'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';

interface ChartData {
  time: string;
  price: number;
  high?: number;
  low?: number;
  volume?: number;
}

interface StockQuote {
  symbol: string;
  price: number;
}

export function LiveChart({ symbol }: { symbol: string }) {
  const [data, setData] = useState<ChartData[]>([]);

  // Fetch historical data
  const { data: historicalData, isLoading } = useQuery({
    queryKey: ['historical', symbol],
    queryFn: async () => {
      const response = await fetch(`/api/markets/historical?symbol=${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch historical data');
      return response.json() as Promise<ChartData[]>;
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 50000,
  });

  // Fetch current quote for live updates
  const { data: currentQuote } = useQuery({
    queryKey: ['current-quote', symbol],
    queryFn: async () => {
      const response = await fetch('/api/markets/stocks');
      if (!response.ok) throw new Error('Failed to fetch current quote');
      const stocks: StockQuote[] = await response.json();
      return stocks.find((stock: StockQuote) => stock.symbol === symbol);
    },
    refetchInterval: 10000, // Every 10 seconds
    staleTime: 8000,
  });

  useEffect(() => {
    if (historicalData && historicalData.length > 0) {
      setData(historicalData.slice(-50)); // Keep last 50 data points
    }
  }, [historicalData]);

  useEffect(() => {
    if (currentQuote && data.length > 0) {
      // Add current price as new data point
      const newDataPoint: ChartData = {
        time: new Date().toLocaleTimeString(),
        price: currentQuote.price
      };

      setData(prevData => {
        const newData = [...prevData];
        const lastDataTime = new Date().getTime();
        const lastPrevTime = new Date(prevData[prevData.length - 1]?.time).getTime();
        
        // Only add if significant time difference (avoid duplicates)
        if (lastDataTime - lastPrevTime > 30000) { // 30 seconds
          newData.push(newDataPoint);
          
          // Keep only last 50 points
          if (newData.length > 50) {
            newData.shift();
          }
        }
        
        return newData;
      });
    }
  }, [currentQuote, data.length]);

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading S&P 500 data...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-400">No market data available</div>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            tickFormatter={(time) => {
              // Show only hour:minute
              return time.split(':').slice(0, 2).join(':');
            }}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            domain={['dataMin - 1', 'dataMax + 1']}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#10B981" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#10B981' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}