import { useQuery } from '@tanstack/react-query';
import DataFetcher from '@/lib/data-fetcher';


export function useMarketData() {
  const dataFetcher = DataFetcher.getInstance();
  
  return useQuery({
    queryKey: ['market-data'],
    queryFn: () => dataFetcher.getMarketData(),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
  });
}

export function useCryptoData() {
  const dataFetcher = DataFetcher.getInstance();
  
  return useQuery({
    queryKey: ['crypto-data'],
    queryFn: () => dataFetcher.getCryptoData(),
    refetchInterval: 60000, // Refetch every minute
    staleTime: 55000,
  });
}

export function useNewsData(category: string = 'business') {
  const dataFetcher = DataFetcher.getInstance();
  
  return useQuery({
    queryKey: ['news', category],
    queryFn: () => dataFetcher.getNewsData(category),
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 240000,
  });
}

export function useEconomicData() {
  const dataFetcher = DataFetcher.getInstance();
  
  return useQuery({
    queryKey: ['economic-indicators'],
    queryFn: () => dataFetcher.getEconomicIndicators(),
    refetchInterval: 3600000, // Refetch every hour
    staleTime: 3000000, // 50 minutes
  });
}