
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

export async function analyzeImage(imageUrl: string, apiKey: string, context?: string): Promise<AIAnalysisResult> {
  if (!apiKey) throw new Error('OpenAI API Key is missing');

  const prompt = `
    Analyze this image for a high-end professional scenic design portfolio.
    The goal is "Supreme" quality—sophisticated, architectural, and artistically precise.

    ${context ? `\nCRITICALLY IMPORTANT CONTEXT: 
    Metadata: "${context}" (Contains Title, Category, and Credits).
    
    INSTRUCTION: 
    - Extract the *Show Title* from this metadata (e.g., if context is "Romero (Scenic Design)...", just use "Romero").
    - Weave it NATURALLY into the sentence.
    - BAD: "In 'Romero (Scenic Design) - Design by Brandon'..."
    - GOOD: "The scenic design for 'Romero' features..."
    - GOOD: "Brandon PT Davis's design for 'Romero' use..."
    
    You MUST mention the production title in the output.` : ''}

    Provide the following in JSON format:
    1. "altText": A descriptive, atmospheric sentence (max 140 chars) summarizing the visual impact and design mood.
       - MUST reference the show/project name if context is provided.
       - **PRIORITIZE SCENIC ELEMENTS**: Describe the physical structures, materials, and colors FIRST.
       - Lighting should only be mentioned as it affects these elements.
       - Example: "The set for 'Romero' features a distressed red brick wall and angular steel platforms, accented by cool blue sidelight."
    2. "caption": A sophisticated, curator-level caption describing the composition, materials, color palette, and spatial relationships.
       - **FOCUS**: 70% Scenic/Architecture/Color, 30% Lighting/Mood.
       - Describe the *specific* colors (e.g., "oxidized copper", "deep crimson", "unbleached muslin") and textures.
       - Analyze the *intent* of the design.
    4. "seoDescription": A compelling, expert-level meta description (150-160 chars).
       - Focus on the *design narrative* and *artistic value*.
       - Example: "Expressionist scenic design for 'Romero' featuring angular structural elements and high-contrast lighting to evoke a fragmented psychological state."
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
