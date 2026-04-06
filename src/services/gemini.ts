import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

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
  content: string; // Markdown
  sources: { title: string; uri: string }[];
}

export async function getTopStories(topic: string = "World News"): Promise<StorySummary[]> {
  const prompt = `You are a senior editor at a prestigious news organization.
Your task is to identify the 5 most important, impactful, and current news stories right now in the category: "${topic}".
Use Google Search to find the latest developments.

For each story, provide:
1. A compelling, journalistic headline.
2. A brief, objective summary (2-3 sentences) that captures the essence of the story.
3. A short, descriptive image query that could be used to find a relevant photo (e.g., "UN general assembly hall", "semiconductor factory").
4. The category (e.g., "Politics", "Technology", "Global Affairs").

Return the result as a JSON array of objects.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              summary: { type: Type.STRING },
              imageQuery: { type: Type.STRING },
              category: { type: Type.STRING },
            },
            required: ["headline", "summary", "imageQuery", "category"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from model");
    
    const parsed = JSON.parse(text) as Omit<StorySummary, 'id' | 'timestamp'>[];
    return parsed.map(story => ({
      ...story,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching top stories:", error);
    throw error;
  }
}

export async function generateArticle(headline: string, summary: string): Promise<Article> {
  const prompt = `You are an award-winning investigative journalist and feature writer for a top-tier publication (like The Atlantic, NYT, or The New Yorker).
Your assignment is to write a deep, comprehensive, and highly readable article about the following story:

Headline: ${headline}
Context: ${summary}

Requirements:
1. Use Google Search to gather the most up-to-date facts, quotes, and context.
2. Write a full-length article (at least 800-1200 words).
3. Adopt a serious, authoritative, yet engaging editorial tone.
4. Structure the article with a strong lede, contextual background, current developments, and broader implications.
5. Use Markdown formatting (headings, bold text, blockquotes for quotes).
6. Do NOT include a conclusion heading like "Conclusion". End the article naturally.
7. Do NOT include placeholder text. Write the actual article.

Write the article now.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from model");

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map(chunk => chunk.web)
      .filter((web): web is { uri: string; title: string } => !!web && !!web.uri && !!web.title);

    // Deduplicate sources by URI
    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

    return {
      headline,
      content: text,
      sources: uniqueSources,
    };
  } catch (error) {
    console.error("Error generating article:", error);
    throw error;
  }
}

export async function askArticleQuestion(articleContent: string, question: string): Promise<string> {
  const prompt = `You are a knowledgeable assistant helping a reader understand a news article.
Answer the user's question based ONLY on the provided article text. If the answer is not in the article, say so politely.

Article Text:
${articleContent}

User Question: ${question}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "I'm sorry, I couldn't generate an answer.";
  } catch (error) {
    console.error("Error answering question:", error);
    throw error;
  }
}
