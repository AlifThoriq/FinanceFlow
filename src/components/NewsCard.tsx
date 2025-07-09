'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Clock, ExternalLink, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Interface yang sesuai dengan yang digunakan di app/page.tsx
interface NewsItem {
  title: string;
  description?: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
  urlToImage?: string;
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

  // Generate slug dari title untuk routing
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    const slug = generateSlug(news.title);
    router.push(`/article/${slug}`);
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
          <span className="font-medium">{news.source.name}</span>
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
      
      {news.urlToImage && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <Image 
            src={news.urlToImage} 
            alt={news.title}
            width={400}
            height={128}
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