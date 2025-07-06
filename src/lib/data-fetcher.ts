  import axios from 'axios';

  export class DataFetcher {
    private static instance: DataFetcher;
    private cache: Map<string, { data: any; timestamp: number }> = new Map();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    public static getInstance(): DataFetcher {
      if (!DataFetcher.instance) {
        DataFetcher.instance = new DataFetcher();
      }
      return DataFetcher.instance;
    }

    async fetchWithCache(key: string, fetchFn: () => Promise<any>) {
      const cached = this.cache.get(key);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }

      try {
        const data = await fetchFn();
        this.cache.set(key, { data, timestamp: Date.now() });
        return data;
      } catch (error) {
        console.error(`Error fetching ${key}:`, error);
        throw error;
      }
    }

    async getMarketData() {
      return this.fetchWithCache('market-data', async () => {
        const response = await axios.get('/api/markets/stocks');
        return response.data;
      });
    }

    async getCryptoData() {
      return this.fetchWithCache('crypto-data', async () => {
        const response = await axios.get('/api/markets/crypto');
        return response.data;
      });
    }

    async getNewsData(category = 'business') {
      return this.fetchWithCache(`news-${category}`, async () => {
        const response = await axios.get(`/api/news?category=${category}`);
        return response.data;
      });
    }

    async getEconomicIndicators() {
      return this.fetchWithCache('economic-indicators', async () => {
        const response = await axios.get('/api/economic/indicators');
        return response.data;
      });
    }
  }
  export default DataFetcher;