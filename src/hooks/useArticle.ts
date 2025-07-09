import { useState, useEffect } from 'react';
import axios from 'axios';

interface Article {
  id: string;
  title: string;
  content: string;
  description?: string;
  url: string;
  source: string;
  author?: string;
  published_at: string;
  image_url?: string;
  category: string;
  slug: string;
  scraped?: boolean;
  scrapeError?: string;
  full_content_available?: boolean;
}

interface UseArticleResult {
  article: Article | null;
  loading: boolean;
  error: string | null;
  scraping: boolean;
}

interface ApiResponse {
  success: boolean;
  article?: Article;
  error?: string;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
}

export function useArticle(slug: string): UseArticleResult {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, try to get the article with scraping
        setScraping(true);
        const response = await axios.post<ApiResponse>('/api/scrape-article', { slug });
                
        if (response.data.success) {
          setArticle(response.data.article || null);
        } else {
          throw new Error(response.data.error || 'Failed to fetch article');
        }

      } catch (err: unknown) {
        const error = err as ApiError;
        console.error('Error fetching article:', error);
        setError(error.response?.data?.error || error.message || 'Failed to load article');
      } finally {
        setLoading(false);
        setScraping(false);
      }
    };

    fetchArticle();
  }, [slug]);

  return { article, loading, error, scraping };
}