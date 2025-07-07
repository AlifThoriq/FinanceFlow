import { NextResponse } from 'next/server';
import axios from 'axios';

interface TwelveDataPoint {
  datetime: string;
  close: string;
  high: string;
  low: string;
  volume: string;
}

interface TwelveDataResponse {
  status?: string;
  message?: string;
  values: TwelveDataPoint[];
}

const TWELVE_API_KEY = process.env.TWELVE_API_KEY;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'AAPL';

    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1min&outputsize=50&apikey=${TWELVE_API_KEY}`;

    const response = await axios.get<TwelveDataResponse>(url);

    if (response.data.status === 'error') {
      console.error('TwelveData Error:', response.data.message);
      return NextResponse.json([], { status: 400 });
    }

    const timeSeries = response.data.values;

    const chartData = timeSeries
      .reverse()
      .map((point: TwelveDataPoint) => ({
        time: point.datetime.split(' ')[1], // HH:mm:ss
        price: parseFloat(point.close),
        high: parseFloat(point.high),
        low: parseFloat(point.low),
        volume: parseFloat(point.volume),
      }));

    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Error fetching TwelveData:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}