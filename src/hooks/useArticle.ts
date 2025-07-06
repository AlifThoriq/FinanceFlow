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
        const response = await axios.post('/api/scrape-article', { slug });
        
        if (response.data.success) {
          setArticle(response.data.article);
        } else {
          throw new Error(response.data.error || 'Failed to fetch article');
        }

      } catch (err: any) {
        console.error('Error fetching article:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load article');
      } finally {
        setLoading(false);
        setScraping(false);
      }
    };

    fetchArticle();
  }, [slug]);

  return { article, loading, error, scraping };
}