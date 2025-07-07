import { NextResponse } from 'next/server';
import axios from 'axios';

// Define types for better type safety
interface StockResult {
  symbol: string;
  description: string;
  type: string;
  displaySymbol: string;
  logo: string;
}

interface CryptoResult {
  id: string;
  symbol: string;
  name: string;
  image: string;
  marketCapRank: number;
}

interface SearchResults {
  stocks: StockResult[];
  crypto: CryptoResult[];
}

interface FinnhubStock {
  symbol: string;
  description: string;
  type: string;
  displaySymbol: string;
}

interface FMPProfile {
  image?: string;
}

interface CoinGeckoCoin {
  id: string;
  symbol: string;
  name: string;
  large: string;
  market_cap_rank: number;
}

const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
const FMP_KEY = process.env.FMP_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type'); // 'stocks', 'crypto', or 'all'

  if (!query || query.length < 2) {
    return NextResponse.json({ stocks: [], crypto: [] });
  }

  try {
    const results: SearchResults = {
      stocks: [],
      crypto: []
    };

    // Search stocks via Finnhub
    if (type === 'stocks' || type === 'all' || !type) {
      try {
        const stockResponse = await axios.get(
          `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${FINNHUB_KEY}`
        );

        const rawResults: FinnhubStock[] = stockResponse.data.result ?? [];

        // 🔁 Filter unique symbols (hindari duplikat symbol seperti HOOD)
        const uniqueStockMap = new Map<string, FinnhubStock>();
        rawResults.forEach((stock) => {
          if (stock.symbol && !uniqueStockMap.has(stock.symbol)) {
            uniqueStockMap.set(stock.symbol, stock);
          }
        });

        const uniqueStocks = Array.from(uniqueStockMap.values()).slice(0, 5);

        // Ambil logo dari FMP untuk tiap symbol
        results.stocks = await Promise.all(
          uniqueStocks.map(async (stock: FinnhubStock) => {
            let logo = '';

           try {
  const fmpRes = await axios.get(
    `https://financialmodelingprep.com/api/v3/profile/${stock.symbol}?apikey=${FMP_KEY}`
  );

  if (Array.isArray(fmpRes.data) && fmpRes.data[0]?.image) {
    logo = fmpRes.data[0].image;
  } else {
    console.warn(`🟡 No logo found for ${stock.symbol} (allowed no-image)`);
  }
} catch (err: any) {
  if (axios.isAxiosError(err) && err.response?.status === 403) {
    console.warn(`🔒 FMP 403: Access denied for ${stock.symbol}`);
  } else {
    console.warn(`⚠️ Error fetching logo for ${stock.symbol}:`, err.message);
  }
}


            return {
              symbol: stock.symbol,
              description: stock.description,
              type: stock.type,
              displaySymbol: stock.displaySymbol,
              logo
            };
          })
        );
      } catch (error) {
        console.error('❌ Error searching stocks:', error);
      }
    }

    // Search crypto via CoinGecko
    if (type === 'crypto' || type === 'all' || !type) {
      try {
        const cryptoResponse = await axios.get(
          `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`
        );

        const coins = cryptoResponse.data.coins as CoinGeckoCoin[];
        results.crypto = coins
          ?.slice(0, 5)
          .map((coin: CoinGeckoCoin) => ({
            id: coin.id,
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            image: coin.large,
            marketCapRank: coin.market_cap_rank,
          })) || [];
      } catch (error) {
        console.error('❌ Error searching crypto:', error);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('❌ Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search', stocks: [], crypto: [] },
      { status: 500 }
    );
  }
}