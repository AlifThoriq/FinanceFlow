import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  scraped_at?: string;
}

interface UseArticleResult {
  article: Article | null;
  loading: boolean;
  error: string | null;
  scraping: boolean;
  scrapingStatus: 'idle' | 'scraping' | 'success' | 'error';
  retryScraping: () => Promise<void>;
}

export function useArticle(slug: string): UseArticleResult {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapingStatus, setScrapingStatus] = useState<'idle' | 'scraping' | 'success' | 'error'>('idle');

  const scrapeArticleContent = useCallback(async (articleData: Article) => {
    try {
      setScraping(true);
      setScrapingStatus('scraping');
      
      const response = await axios.post('/api/scrape-article', { 
        slug 
      }, {
        timeout: 30000 // 30 seconds timeout
      });

      if (response.data.success) {
        const updatedArticle = response.data.article;
        setArticle(updatedArticle);
        
        if (updatedArticle.scraped && updatedArticle.content.length > articleData.content?.length) {
          setScrapingStatus('success');
        } else if (updatedArticle.scrapeError) {
          setScrapingStatus('error');
        }
      }
    } catch (err) {
      console.error('Scraping failed:', err);
      setScrapingStatus('error');
    } finally {
      setScraping(false);
    }
  }, [slug]);

  const fetchArticle = useCallback(async () => {
    if (!slug) return;

    try {
      setLoading(true);
      setError(null);
      
      // First, get the basic article data
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single();

      if (articleError) {
        setError('Article not found');
        return;
      }

      setArticle(articleData);

      // Check if we need to scrape content
      const needsScraping = !articleData.content || 
                           articleData.content.length < 500 || 
                           articleData.content.includes('[+') || 
                           articleData.content.includes('chars]') ||
                           !articleData.full_content_available;

      if (needsScraping) {
        await scrapeArticleContent(articleData);
      }

    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  }, [slug, scrapeArticleContent]);

  const retryScraping = useCallback(async () => {
    if (article) {
      await scrapeArticleContent(article);
    }
  }, [article, scrapeArticleContent]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  return { 
    article, 
    loading, 
    error, 
    scraping, 
    scrapingStatus,
    retryScraping 
  };
}