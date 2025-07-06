'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Clock, ExternalLink, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  slug: string;
}

export function NewsCard({ news }: { news: NewsItem }) {
  const router = useRouter();

  const timeAgo = (date: string) => {
    const now = new Date();
    const published = new Date(date);
    const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/article/${news.slug}`);
  };

  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(news.url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/50 transition-all duration-300 cursor-pointer group"
      onClick={handleReadMore}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span className="font-medium">{news.source}</span>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{timeAgo(news.publishedAt)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExternalLink}
            className="p-1 rounded text-gray-500 hover:text-blue-400 transition-colors"
            title="Open original article"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
        {news.title}
      </h3>
      
      {news.description && (
        <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed mb-4">
          {news.description}
        </p>
      )}
      
      {news.imageUrl && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img 
            src={news.imageUrl} 
            alt={news.title}
            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Read More Button */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handleReadMore}
          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors font-medium"
        >
          <span>Read More</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
        
        <div className="text-xs text-gray-500">
          ~{Math.ceil((news.description?.length || 0) / 200)} min read
        </div>
      </div>
    </motion.div>
  );
}