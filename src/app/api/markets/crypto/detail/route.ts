import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    // First, get the coin ID from symbol
    const listResponse = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        ids: '',
        order: 'market_cap_desc',
        per_page: 250,
        page: 1
      }
    });

    const coin = listResponse.data.find((c: any) => 
      c.symbol.toLowerCase() === symbol.toLowerCase()
    );

    if (!coin) {
      return NextResponse.json({ error: 'Cryptocurrency not found' }, { status: 404 });
    }

    // Get detailed data using coin ID (not symbol!)
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin.id}`, {
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
  } catch (error: any) {
    console.error('Error fetching crypto detail:', error);
    
    // Better error logging
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch crypto detail',
      details: error.response?.data || error.message 
    }, { status: 500 });
  }
}