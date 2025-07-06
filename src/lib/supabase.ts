import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Article {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  source: string;
  published_at: string;
  image_url: string | null;
  category: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

// Helper functions
export const articleService = {
  async getBySlug(slug: string): Promise<Article | null> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      console.error('Error fetching article:', error);
      return null;
    }
    
    return data;
  },

  async getRelated(category: string, excludeId: string, limit: number = 4): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('category', category)
      .neq('id', excludeId)
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching related articles:', error);
      return [];
    }
    
    return data || [];
  },

  async getRecent(limit: number = 10): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching recent articles:', error);
      return [];
    }
    
    return data || [];
  },

  async searchArticles(query: string, limit: number = 20): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error searching articles:', error);
      return [];
    }
    
    return data || [];
  }
};