import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const NEWS_API_KEY = process.env.NEWS_API_KEY;

// Define types for better type safety
interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: {
    name: string;
  };
  publishedAt: string;
  urlToImage: string | null;
}

interface NewsApiResponse {
  articles: NewsArticle[];
}

interface ProcessedArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    // Map symbols to search terms
    const searchTerms: { [key: string]: string } = {
      'SPY': 'S&P 500 OR SPY ETF',
      'QQQ': 'NASDAQ OR QQQ ETF OR technology stocks',
      'DIA': 'Dow Jones OR DIA ETF',
      'IWM': 'Russell 2000 OR IWM ETF OR small cap'
    };

    const query = searchTerms[symbol] || symbol;

    const response = await axios.get<NewsApiResponse>('https://newsapi.org/v2/everything', {
      params: {
        q: query,
        apiKey: NEWS_API_KEY,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 10,
        domains: 'reuters.com,bloomberg.com,cnbc.com,marketwatch.com,yahoo.com,wsj.com'
      }
    });

    const articles: ProcessedArticle[] = response.data.articles
      .filter((article: NewsArticle) => 
        article.title && 
        article.description && 
        !article.title.includes('[Removed]') &&
        !article.description.includes('[Removed]')
      )
      .map((article: NewsArticle): ProcessedArticle => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source?.name || 'Unknown',
        publishedAt: article.publishedAt,
        imageUrl: article.urlToImage
      }));

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching stock news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}