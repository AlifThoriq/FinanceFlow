import { NextResponse } from 'next/server';
import axios from 'axios';

const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

export async function GET() {
  try {
    const symbols = ['SPY', 'QQQ', 'DIA', 'IWM'];

    const requests = symbols.map(symbol =>
      axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`)
    );

    const responses = await Promise.all(requests);

    const stockData = responses.map((response, index) => {
      const quote = response.data;

      return {
        symbol: symbols[index],
        price: quote.c, // current price
        change: quote.d, // change
        changePercent: quote.dp, // change percent
        volume: quote.v ?? 0,
        timestamp: new Date()
      };
    });

    return NextResponse.json(stockData);
  } catch (error) {
    console.error('Error fetching stock data from Finnhub:', error);
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
  }
}
