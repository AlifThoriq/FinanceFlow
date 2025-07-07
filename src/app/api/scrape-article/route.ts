import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ScrapedContent {
  title: string;
  content: string;
  htmlContent: string; // Add HTML content
  author?: string;
  publishedAt?: string;
  imageUrl?: string;
  images: string[]; // Add array of images
}

interface UpdateData {
  content: string;
  author?: string;
  scraped_at: string;
  full_content_available: boolean;
  html_content?: string;
  content_images?: string[];
}

class ArticleScraper {
  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
  }

  private static processImages($: cheerio.Root, baseUrl: string): string[] {
    const images: string[] = [];
    
    // Find all images in the article content
    const imgElements = $('img');
    
    imgElements.each((_, element) => {
      const src = $(element).attr('src');
      if (src) {
        // Convert relative URLs to absolute URLs
        const absoluteUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
        
        // Filter out small images (likely ads, icons, etc.)
        const width = $(element).attr('width');
        const height = $(element).attr('height');
        
        if (!width || !height || (parseInt(width) > 200 && parseInt(height) > 200)) {
          images.push(absoluteUrl);
        }
      }
    });
    
    return images;
  }

  private static convertToReadableHTML($: cheerio.Root, contentElement: cheerio.Cheerio): string {
    // Remove unwanted elements
    contentElement.find('script, style, .advertisement, .ad, .social-share, .related-articles, .comments, .sidebar, nav, footer, header').remove();
    
    // Process images - add alt text and proper formatting
    contentElement.find('img').each((_, img) => {
      const $img = $(img);
      const src = $img.attr('src');
      const alt = $img.attr('alt') || 'Article image';
      
      if (src) {
        // Wrap images in figure tags for better formatting
        $img.wrap('<figure class="article-image"></figure>');
        $img.after(`<figcaption>${alt}</figcaption>`);
      }
    });

    // Clean up and format content
    let htmlContent = contentElement.html() || '';
    
    // Clean up extra whitespace
    htmlContent = htmlContent
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
    
    return htmlContent;
  }

  private static extractFromCommonSelectors($: cheerio.Root, url: string): ScrapedContent {
    // Enhanced content selectors for better coverage
    const contentSelectors = [
      'article .entry-content',
      'article .post-content', 
      '.article-content',
      '.story-body',
      '.article-body',
      '[data-module="ArticleBody"]',
      '.article-wrap .content',
      '.post-entry',
      '.entry-content',
      '.content-body',
      'div[data-testid="article-content"]',
      '.ArticleBody-articleBody',
      '.RichTextStoryBody',
      '.ArticleBodyWrapper',
      '.story-content',
      '.post-body',
      '.article-text',
      '.content-wrapper',
      'main article',
      '.article-container .content',
      // Bleacher Report specific selectors
      '.article-body-content',
      '.article-body__content',
      '.content-body__content'
    ];

    const titleSelectors = [
      'h1.entry-title',
      'h1.post-title',
      'h1.article-title',
      '.headline',
      'h1[data-testid="headline"]',
      '.ArticleHeader-headline',
      'h1.article-headline',
      'h1'
    ];

    const authorSelectors = [
      '.author-name',
      '.byline-author',
      '[data-testid="author-name"]',
      '.ArticleHeader-author',
      '.article-author',
      '.byline .author'
    ];

    let content = '';
    let htmlContent = '';
    let title = '';
    let author = '';

    // Extract title
    for (const selector of titleSelectors) {
      const titleEl = $(selector).first();
      if (titleEl.length && titleEl.text().trim()) {
        title = this.cleanText(titleEl.text());
        break;
      }
    }

    // Extract content with HTML preservation
    for (const selector of contentSelectors) {
      const contentEl = $(selector);
      if (contentEl.length) {
        // Remove unwanted elements first
        contentEl.find('script, style, .advertisement, .ad, .social-share, .related-articles, .comments, .newsletter-signup, .promo-box').remove();
        
        // Check if this selector gives us substantial content
        const textContent = contentEl.text().trim();
        const paragraphs = contentEl.find('p').length;
        const hasImages = contentEl.find('img').length > 0;
        
        // Use this selector if it has substantial content
        if (textContent.length > 200 || paragraphs > 2 || hasImages) {
          // Extract clean text
          const textParagraphs = contentEl.find('p, h2, h3, h4, h5, h6').map((_, el) => {
            const text = $(el).text().trim();
            const tagName = $(el).prop('tagName')?.toLowerCase();
            
            // Add formatting for headings
            if (tagName?.startsWith('h') && text) {
              return `\n## ${text}\n`;
            }
            return text;
          }).get();
          
          content = textParagraphs.filter(p => p.length > 30).join('\n\n');
          
          // Extract HTML content
          htmlContent = this.convertToReadableHTML($, contentEl);
          break;
        }
      }
    }

    // Fallback: get all content from main article tags
    if (!content || content.length < 500) {
      const mainArticle = $('article, main, .main-content, .content-main').first();
      if (mainArticle.length) {
        // Remove navigation, sidebar, and other non-content elements
        mainArticle.find('nav, aside, .sidebar, .navigation, .menu, .header, .footer, .comments, .related, .social').remove();
        
        const allParagraphs = mainArticle.find('p, h2, h3, h4, h5, h6').map((_, el) => {
          const text = $(el).text().trim();
          const tagName = $(el).prop('tagName')?.toLowerCase();
          
          if (tagName?.startsWith('h') && text) {
            return `\n## ${text}\n`;
          }
          return text;
        }).get();
        
        const fallbackContent = allParagraphs
          .filter(p => p.length > 30)
          .slice(0, 20)
          .join('\n\n');
        
        if (fallbackContent.length > content.length) {
          content = fallbackContent;
          htmlContent = this.convertToReadableHTML($, mainArticle);
        }
      }
    }

    // Extract author
    for (const selector of authorSelectors) {
      const authorEl = $(selector).first();
      if (authorEl.length && authorEl.text().trim()) {
        author = this.cleanText(authorEl.text().replace(/^by\s+/i, ''));
        break;
      }
    }

    // Extract images
    const images = this.processImages($, url);

    return {
      title: title || '',
      content: this.cleanText(content),
      htmlContent: htmlContent,
      author: author || undefined,
      images: images
    };
  }

  static async scrapeArticle(url: string): Promise<ScrapedContent> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'no-cache'
        },
        timeout: 30000,
        maxRedirects: 10,
        validateStatus: (status) => status < 500 // Accept redirects and client errors
      });

      const $ = cheerio.load(response.data);
      const result = this.extractFromCommonSelectors($, url);
      
      // Validate that we got meaningful content
      if (!result.content || result.content.length < 100) {
        throw new Error('Insufficient content extracted from article');
      }
      
      return result;
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Scraping error for URL:', url, errorMessage);
      throw new Error(`Failed to scrape article: ${errorMessage}`);
    }
  }
}

export async function POST(request: Request) {
  try {
    const { slug } = await request.json();
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // Get article from database
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (fetchError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Check if we already have substantial content
    if (article.content && 
        article.content.length > 1000 && 
        !article.content.includes('[+') && 
        !article.content.includes('chars]') &&
        article.full_content_available) {
      return NextResponse.json({
        success: true,
        article: {
          ...article,
          scraped: false
        }
      });
    }

    try {
      console.log('Scraping article:', article.url);
      
      // Scrape the full article
      const scrapedContent = await ArticleScraper.scrapeArticle(article.url);
      
      if (!scrapedContent.content || scrapedContent.content.length < 200) {
        throw new Error('Insufficient content scraped - content too short');
      }

      // Prepare update data
      const updateData: UpdateData = {
        content: scrapedContent.content,
        author: scrapedContent.author || article.author,
        scraped_at: new Date().toISOString(),
        full_content_available: true
      };

      // Add HTML content if available
      if (scrapedContent.htmlContent) {
        updateData.html_content = scrapedContent.htmlContent;
      }

      // Add images if available
      if (scrapedContent.images && scrapedContent.images.length > 0) {
        updateData.content_images = scrapedContent.images;
      }

      // Update the article with scraped content
      const { error: updateError } = await supabase
        .from('articles')
        .update(updateData)
        .eq('slug', slug);

      if (updateError) {
        console.error('Error updating article:', updateError);
      }

      return NextResponse.json({
        success: true,
        article: {
          ...article,
          ...updateData,
          scraped: true
        }
      });

    } catch (scrapeError: unknown) {
      const errorMessage = scrapeError instanceof Error ? scrapeError.message : 'Unknown scraping error';
      console.error('Scraping failed:', errorMessage);
      
      // Return original article even if scraping fails
      return NextResponse.json({
        success: true,
        article: {
          ...article,
          scraped: false,
          scrapeError: errorMessage
        }
      });
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('API Error:', errorMessage);
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage }, 
      { status: 500 }
    );
  }
}