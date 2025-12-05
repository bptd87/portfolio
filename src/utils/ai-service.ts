
import { createClient } from './supabase/client';

/**
 * AI Service for generating image descriptions and SEO metadata.
 * Uses OpenAI's GPT-4o (or similar) via direct API call.
 * 
 * NOTE: In a production environment, this should be proxied through a backend 
 * (like Supabase Edge Functions) to hide the API Key. 
 * For this Admin Panel, we will store the key in the browser's localStorage 
 * or prompt the user for it.
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface AIAnalysisResult {
  altText: string;
  caption: string;
  tags: string[];
  seoDescription: string;
}

export async function analyzeImage(imageUrl: string, apiKey: string): Promise<AIAnalysisResult> {
  if (!apiKey) throw new Error('OpenAI API Key is missing');

  const prompt = `
    Analyze this image for a scenic design portfolio website.
    Provide the following in JSON format:
    1. "altText": A concise, descriptive alt text for accessibility (max 125 chars).
    2. "caption": A professional caption describing the visual elements, lighting, and mood.
    3. "tags": An array of 5-8 relevant keywords (e.g., "scenic design", "theatre", "lighting", "moody", "texture").
    4. "seoDescription": A 1-2 sentence description optimized for SEO, including the likely subject matter.
  `;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o", // Or gpt-4-turbo
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  "url": imageUrl,
                  "detail": "low" // Low detail is cheaper and usually sufficient for alt text
                }
              }
            ]
          }
        ],
        max_tokens: 300,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to analyze image');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content) as AIAnalysisResult;

  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw error;
  }
}

// Helper to manage the API Key
export const AI_KEY_STORAGE = 'brandon_ai_key';

export function getAIKey(): string | null {
  return localStorage.getItem(AI_KEY_STORAGE);
}

export function setAIKey(key: string) {
  localStorage.setItem(AI_KEY_STORAGE, key);
}
