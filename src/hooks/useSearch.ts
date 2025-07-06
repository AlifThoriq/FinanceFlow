import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface SearchResult {
  stocks: Array<{
    symbol: string;
    description: string;
    type: string;
    displaySymbol: string;
    logo?: string; 
  }>;
  crypto: Array<{
    id: string;
    symbol: string;
    name: string;
    image: string;
    marketCapRank: number;
  }>;
}

export function useSearch(query: string, type: 'stocks' | 'crypto' | 'all' = 'all') {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [query]);

  return useQuery<SearchResult>({
    queryKey: ['search', debouncedQuery, type],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return { stocks: [], crypto: [] };
      }

      const params = new URLSearchParams({
        q: debouncedQuery,
        type: type
      });

      const response = await fetch(`/api/search?${params}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      return response.json();
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}