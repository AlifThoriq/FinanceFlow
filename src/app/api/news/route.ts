import { NextResponse } from 'next/server';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
    .substring(0, 100);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'business';
  
  try {
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        category: category,
        language: 'en',
        pageSize: 20,
        apiKey: NEWS_API_KEY
      }
    });

    const articles = response.data.articles;
    const processedArticles = [];

    for (const article of articles) {
      if (!article.title || !article.url) continue;

      const slug = generateSlug(article.title);
      
      // Check if article already exists
      const { data: existingArticle } = await supabase
        .from('articles')
        .select('id, slug')
        .eq('url', article.url)
        .single();

      let articleId = existingArticle?.id;
      let articleSlug = existingArticle?.slug;

      if (!existingArticle) {
        // Insert new article
        const { data: newArticle, error } = await supabase
          .from('articles')
          .insert({
            title: article.title,
            description: article.description,
            content: article.content || article.description || '',
            url: article.url,
            source: article.source.name,
            published_at: new Date(article.publishedAt).toISOString(),
            image_url: article.urlToImage,
            category: category,
            slug: slug
          })
          .select('id, slug')
          .single();

        if (error) {
          console.error('Error inserting article:', error);
          continue;
        }

        articleId = newArticle?.id;
        articleSlug = newArticle?.slug;
      }

      processedArticles.push({
        id: articleId,
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: new Date(article.publishedAt),
        imageUrl: article.urlToImage,
        category: category,
        slug: articleSlug
      });
    }

    return NextResponse.json(processedArticles);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}