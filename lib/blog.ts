export interface BlogPost {
  title: string;
  url: string;
  publishedAt: Date;
}

/**
 * Parses an RSS XML feed string to extract blog post items.
 * Uses regular expressions to extract title, link, and pubDate elements, 
 * automatically sanitizing CDATA wrappers and XML entities.
 */
export function parseRssFeed(xmlText: string): BlogPost[] {
  if (!xmlText) return [];
  const posts: BlogPost[] = [];
  
  // Extract all <item> elements
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];
    
    // Extract title (handling optional CDATA wrapper)
    const titleMatch = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/.exec(itemContent);
    
    // Extract link (handling optional CDATA wrapper)
    const linkMatch = /<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/.exec(itemContent);
    
    // Extract pubDate (handling optional CDATA wrapper)
    const pubDateMatch = /<pubDate>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/.exec(itemContent);
    
    if (titleMatch && linkMatch) {
      // Clean XML character entities
      const title = titleMatch[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .trim();
        
      const url = linkMatch[1].trim();
      const pubDateStr = pubDateMatch ? pubDateMatch[1].trim() : new Date().toUTCString();
      
      // Parse the published timestamp (ensuring date is valid)
      let parsedDate = new Date(pubDateStr);
      if (isNaN(parsedDate.getTime())) {
        parsedDate = new Date();
      }

      posts.push({
        title,
        url,
        publishedAt: parsedDate
      });
    }
  }
  
  return posts;
}
