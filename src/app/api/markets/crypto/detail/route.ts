import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  image: string;
  market_cap_rank: number;
  price_change_percentage_24h: number;
}

interface CoinDetailResponse {
  id: string;
  symbol: string;
  name: string;
  image: {
    large: string;
  };
  market_cap_rank: number;
  market_data: {
    current_price: { usd: number };
    price_change_percentage_24h: number;
    market_cap: { usd: number };
    total_volume: { usd: number };
    circulating_supply: number;
    max_supply: number | null;
    ath: { usd: number };
    atl: { usd: number };
    ath_date: { usd: string };
    atl_date: { usd: string };
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    // First, get the coin ID from symbol
    const listResponse = await axios.get<CoinMarketData[]>('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        ids: '',
        order: 'market_cap_desc',
        per_page: 250,
        page: 1
      }
    });

    const coin = listResponse.data.find((c: CoinMarketData) => 
      c.symbol.toLowerCase() === symbol.toLowerCase()
    );

    if (!coin) {
      return NextResponse.json({ error: 'Cryptocurrency not found' }, { status: 404 });
    }

    // Get detailed data using coin ID (not symbol!)
    const response = await axios.get<CoinDetailResponse>(`https://api.coingecko.com/api/v3/coins/${coin.id}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false
      }
    });

    const coinDetail = response.data;
    
    const cryptoDetail = {
      id: coinDetail.id,
      symbol: coinDetail.symbol.toUpperCase(),
      name: coinDetail.name,
      price: coinDetail.market_data.current_price.usd,
      change24h: coinDetail.market_data.price_change_percentage_24h,
      marketCap: coinDetail.market_data.market_cap.usd,
      volume: coinDetail.market_data.total_volume.usd,
      image: coinDetail.image.large,
      rank: coinDetail.market_cap_rank,
      supply: coinDetail.market_data.circulating_supply,
      maxSupply: coinDetail.market_data.max_supply,
      ath: coinDetail.market_data.ath.usd,
      atl: coinDetail.market_data.atl.usd,
      athDate: coinDetail.market_data.ath_date.usd,
      atlDate: coinDetail.market_data.atl_date.usd,
    };

    return NextResponse.json(cryptoDetail);
  } catch (error: unknown) {
    console.error('Error fetching crypto detail:', error);
    
    // Better error logging
    if (axios.isAxiosError(error) && error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch crypto detail',
      details: axios.isAxiosError(error) ? error.response?.data || error.message : 'Unknown error'
    }, { status: 500 });
  }
}