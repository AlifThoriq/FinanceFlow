import { NextResponse } from 'next/server';
import axios from 'axios';

const FRED_API_KEY = process.env.FRED_API_KEY;

export async function GET() {
  try {
    // Fetch key economic indicators from FRED
    const indicators = {
      'UNRATE': 'Unemployment Rate',
      'CPIAUCSL': 'Consumer Price Index',
      'GDP': 'Gross Domestic Product',
      'FEDFUNDS': 'Federal Funds Rate'
    };

    const promises = Object.keys(indicators).map(seriesId =>
      axios.get(`https://api.stlouisfed.org/fred/series/observations`, {
        params: {
          series_id: seriesId,
          api_key: FRED_API_KEY,
          file_type: 'json',
          limit: 1,
          sort_order: 'desc'
        }
      })
    );

    const responses = await Promise.all(promises);
    
    const economicData = responses.map((response, index) => {
      const seriesId = Object.keys(indicators)[index];
      const observation = response.data.observations[0];
      
      return {
        indicator: indicators[seriesId as keyof typeof indicators],
        value: parseFloat(observation.value),
        date: observation.date,
        seriesId: seriesId
      };
    });

    return NextResponse.json(economicData);
  } catch (error) {
    console.error('Error fetching economic data:', error);
    return NextResponse.json({ error: 'Failed to fetch economic data' }, { status: 500 });
  }
}