'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Clock, 
  ExternalLink, 
  Share2, 
  BookmarkPlus,
  Eye,
  Calendar,
  Building,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  source: string;
  author?: string;
  published_at: string;
  image_url: string;
  category: string;
  slug: string;
  scraped?: boolean;
  scrapeError?: string;
  full_content_available?: boolean;
  scraped_at?: string;
}

interface ErrorResponse {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
}

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapingStatus, setScrapingStatus] = useState<'idle' | 'scraping' | 'success' | 'error'>('idle');

  const scrapeArticleContent = useCallback(async (articleData: Article) => {
    try {
      setScraping(true);
      setScrapingStatus('scraping');
      
      const response = await axios.post('/api/scrape-article', { 
        slug: params.slug 
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
      const errorResponse = err as ErrorResponse;
      console.error('Error details:', errorResponse.response?.data?.error || errorResponse.message);
      setScrapingStatus('error');
    } finally {
      setScraping(false);
    }
  }, [params.slug]);

  const fetchRelatedArticles = useCallback(async (category: string, currentId: string) => {
    try {
      const { data: relatedData } = await supabase
        .from('articles')
        .select('*')
        .eq('category', category)
        .neq('id', currentId)
        .order('published_at', { ascending: false })
        .limit(4);

      setRelatedArticles(relatedData || []);
    } catch (err) {
      console.error('Error fetching related articles:', err);
    }
  }, []);

  const fetchArticle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, get the basic article data
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', params.slug)
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

      // Fetch related articles
      await fetchRelatedArticles(articleData.category, articleData.id);

    } catch (err) {
      setError('Failed to load article');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [params.slug, scrapeArticleContent, fetchRelatedArticles]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const handleRetryScrap = async () => {
    if (article) {
      await scrapeArticleContent(article);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const isContentTruncated = (content: string) => {
    return content.includes('[+') && content.includes('chars]');
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading article...</p>
          {scraping && (
            <p className="text-blue-400 text-sm mt-2">Getting full content...</p>
          )}
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Article Not Found</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-700 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <div className="flex items-center space-x-4">
              {/* Scraping Status Indicator */}
              {scraping && (
                <div className="flex items-center space-x-2 text-blue-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading full content...</span>
                </div>
              )}
              
              {scrapingStatus === 'success' && !scraping && (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Full content loaded</span>
                </div>
              )}

              <button
                onClick={handleShare}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                <BookmarkPlus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <button 
            onClick={() => router.push('/')}
            className="hover:text-white transition-colors"
          >
            Home
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="capitalize">{article.category}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-300 truncate">{article.title}</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden"
        >
          {/* Content Quality Warning */}
          {isContentTruncated(article.content) && scrapingStatus !== 'scraping' && (
            <div className="m-6 p-4 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-yellow-400 font-medium mb-1">Limited Content Preview</h4>
                  <p className="text-yellow-200/80 text-sm mb-3">
                    This article shows only a preview. Click to load the full content from the original source.
                  </p>
                  <button
                    onClick={handleRetryScrap}
                    disabled={scraping}
                    className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {scraping ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Load Full Content</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Article Header */}
          <div className="p-8">
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span className="font-medium">{article.source}</span>
              </div>
              {article.author && (
                <div className="flex items-center space-x-2">
                  <span>by</span>
                  <span className="font-medium text-gray-300">{article.author}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(article.published_at)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>~{getReadingTime(article.content)} min read</span>
              </div>
              <span className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium capitalize">
                {article.category}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              {article.title}
            </h1>

            {article.description && (
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                {article.description}
              </p>
            )}
          </div>

          {/* Article Image */}
          {article.image_url && (
            <div className="px-8 mb-8">
              <div className="rounded-xl overflow-hidden">
                <Image
                  src={article.image_url}
                  alt={article.title}
                  width={800}
                  height={400}
                  className="w-full h-64 md:h-96 object-cover"
                  priority
                />
              </div>
            </div>
          )}

          {/* Article Content */}
          <div className="px-8 pb-8">
            <div className="prose prose-invert prose-lg max-w-none">
              <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                {article.content}
              </div>
            </div>

            {/* Content Stats */}
            {article.scraped_at && (
              <div className="mt-6 p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
                <div className="flex items-center space-x-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Full content loaded from source • {formatDate(article.scraped_at)}</span>
                </div>
              </div>
            )}

            {/* Source Link */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>Read original article</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.map((relatedArticle, index) => (
                <motion.div
                  key={relatedArticle.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => router.push(`/article/${relatedArticle.slug}`)}
                  className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/50 transition-all duration-300 cursor-pointer group"
                >
                  {relatedArticle.image_url && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={relatedArticle.image_url}
                        alt={relatedArticle.title}
                        width={400}
                        height={200}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                    <span className="font-medium">{relatedArticle.source}</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(relatedArticle.published_at)}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
                    {relatedArticle.title}
                  </h3>
                  
                  {relatedArticle.description && (
                    <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">
                      {relatedArticle.description}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}