import { NextResponse } from 'next/server';
import axios from 'axios';

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
    const results: {
      stocks: {
        symbol: string;
        description: string;
        type: string;
        displaySymbol: string;
        logo: string;
      }[];
      crypto: {
        id: string;
        symbol: string;
        name: string;
        image: string;
        marketCapRank: number;
      }[];
    } = {
      stocks: [],
      crypto: []
    };

    // Search stocks via Finnhub
    if (type === 'stocks' || type === 'all' || !type) {
      try {
        const stockResponse = await axios.get(
          `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${FINNHUB_KEY}`
        );

        const rawResults: any[] = stockResponse.data.result ?? [];

        // 🔁 Filter unique symbols (hindari duplikat symbol seperti HOOD)
        const uniqueStockMap = new Map<string, any>();
        rawResults.forEach((stock) => {
          if (stock.symbol && !uniqueStockMap.has(stock.symbol)) {
            uniqueStockMap.set(stock.symbol, stock);
          }
        });

        const uniqueStocks = Array.from(uniqueStockMap.values()).slice(0, 5);

        // Ambil logo dari FMP untuk tiap symbol
        results.stocks = await Promise.all(
          uniqueStocks.map(async (stock: any) => {
            let logo = '';

            try {
              const fmp = await axios.get(
                `https://financialmodelingprep.com/api/v3/profile/${stock.symbol}?apikey=${FMP_KEY}`
              );
              logo = fmp.data?.[0]?.image || '';
            } catch (e) {
              console.warn(`⚠️ Failed to fetch FMP logo for ${stock.symbol}`);
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

        results.crypto = cryptoResponse.data.coins
          ?.slice(0, 5)
          .map((coin: any) => ({
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
