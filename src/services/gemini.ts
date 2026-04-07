// We use standard fetch now instead of the Google library for the main news
export interface StorySummary {
  id: string;
  headline: string;
  summary: string;
  category: string;
  imageQuery: string;
  timestamp: string;
}

export interface Article {
  headline: string;
  content: string; 
  sources: { title: string; uri: string }[];
}

export async function getTopStories(topic: string = "general"): Promise<StorySummary[]> {
  try {
    // Map your app topics to NewsAPI categories
    const category = topic.toLowerCase().includes("world") ? "general" : topic.toLowerCase();
    
const response = await fetch(
  `/api/news?category=${category}`
);
    
    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error(data.message || "Failed to fetch from NewsAPI");
    }

    // Convert NewsAPI format to your app's StorySummary format
    return data.articles.slice(0, 5).map((article: any) => ({
      id: article.url || Math.random().toString(36).substring(2, 9),
      headline: article.title,
      summary: article.description || "Click to read the full story on the original source.",
      category: topic,
      imageQuery: article.urlToImage || "", // NewsAPI gives a real image URL!
      timestamp: article.publishedAt || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching top stories:", error);
    // Return empty list so the app doesn't crash
    return [];
  }
}

/**
 * GENERATE FULL ARTICLE
 * Since NewsAPI only gives summaries, we can still use a 'fetch' to the original 
 * article or use a very small Gemini call here if you still have credits.
 * For now, this returns the original content to save your API quota.
 */
export async function generateArticle(headline: string, summary: string): Promise<Article> {
  return {
    headline,
    content: `## ${headline}\n\n${summary}\n\n*Note: Full article generation is currently limited to save API quota. Please check the sources below for the full story.*`,
    sources: [{ title: "View Original Source", uri: "#" }],
  };
}

export async function askArticleQuestion(articleContent: string, question: string): Promise<string> {
  return "AI Chat is currently paused to stay within free tier limits. Please check back later!";
}
