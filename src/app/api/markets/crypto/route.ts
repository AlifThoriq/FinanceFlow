import { NextResponse } from 'next/server';
import axios from 'axios';

interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

export async function GET() {
  try {
    const response = await axios.get<CoinMarketData[]>('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 4,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h'
      }
    });

    const cryptoData = response.data.map((coin: CoinMarketData) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h,
      marketCap: coin.market_cap,
      volume: coin.total_volume,
      image: coin.image
    }));

    return NextResponse.json(cryptoData);
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return NextResponse.json({ error: 'Failed to fetch crypto data' }, { status: 500 });
  }
}