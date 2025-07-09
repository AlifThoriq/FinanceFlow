import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const NEWS_API_KEY = process.env.NEWS_API_KEY;

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source?: {
    name: string;
  };
  publishedAt: string;
  urlToImage?: string;
}

interface NewsApiResponse {
  articles: NewsArticle[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    
    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    // Map crypto symbols to search terms for better news results
    const searchTerms: { [key: string]: string } = {
      'BTC': 'Bitcoin OR BTC cryptocurrency',
      'ETH': 'Ethereum OR ETH cryptocurrency',
      'USDT': 'Tether OR USDT stablecoin',
      'BNB': 'Binance Coin OR BNB cryptocurrency',
      'XRP': 'Ripple OR XRP cryptocurrency',
      'ADA': 'Cardano OR ADA cryptocurrency',
      'DOGE': 'Dogecoin OR DOGE cryptocurrency',
      'SOL': 'Solana OR SOL cryptocurrency',
      'DOT': 'Polkadot OR DOT cryptocurrency',
      'MATIC': 'Polygon OR MATIC cryptocurrency',
      'AVAX': 'Avalanche OR AVAX cryptocurrency',
      'UNI': 'Uniswap OR UNI cryptocurrency',
      'LINK': 'Chainlink OR LINK cryptocurrency',
      'LTC': 'Litecoin OR LTC cryptocurrency',
      'ATOM': 'Cosmos OR ATOM cryptocurrency',
      'BCH': 'Bitcoin Cash OR BCH cryptocurrency',
      'NEAR': 'NEAR Protocol OR NEAR cryptocurrency',
      'FTM': 'Fantom OR FTM cryptocurrency',
      'ALGO': 'Algorand OR ALGO cryptocurrency',
      'MANA': 'Decentraland OR MANA cryptocurrency'
    };

    const query = searchTerms[symbol.toUpperCase()] || `${symbol} cryptocurrency`;

    const response = await axios.get<NewsApiResponse>('https://newsapi.org/v2/everything', {
      params: {
        q: query,
        apiKey: NEWS_API_KEY,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 15,
        domains: 'coindesk.com,cointelegraph.com,decrypt.co,theblock.co,bitcoinmagazine.com,cryptonews.com,cryptoslate.com,blockonomi.com,ambcrypto.com,u.today'
      }
    });

    const articles = response.data.articles
      .filter((article: NewsArticle) => 
        article.title && 
        article.description && 
        !article.title.includes('[Removed]') &&
        !article.description.includes('[Removed]') &&
        // Filter out articles that don't seem crypto-related
        (article.title.toLowerCase().includes('crypto') ||
         article.title.toLowerCase().includes('bitcoin') ||
         article.title.toLowerCase().includes('blockchain') ||
         article.title.toLowerCase().includes(symbol.toLowerCase()) ||
         article.description.toLowerCase().includes('crypto') ||
         article.description.toLowerCase().includes('bitcoin') ||
         article.description.toLowerCase().includes('blockchain') ||
         article.description.toLowerCase().includes(symbol.toLowerCase()))
      )
      .map((article: NewsArticle) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source?.name || 'Unknown',
        publishedAt: article.publishedAt,
        imageUrl: article.urlToImage
      }));

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching crypto news:', error);
    return NextResponse.json({ error: 'Failed to fetch crypto news' }, { status: 500 });
  }
}