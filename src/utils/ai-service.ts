import { createClient } from "./supabase/client";

/**
 * AI Service for generating image descriptions and SEO metadata.
 * Uses OpenAI's GPT-4o (or similar) via direct API call.
 *
 * NOTE: In a production environment, this should be proxied through a backend
 * (like Supabase Edge Functions) to hide the API Key.
 * For this Admin Panel, we will store the key in the browser's localStorage
 * or prompt the user for it.
 */

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export interface AIAnalysisResult {
  altText: string;
  caption: string;
  tags: string[];
  seoDescription: string;
}

export async function analyzeImage(
  imageUrl: string,
  apiKey: string,
  context?: string,
): Promise<AIAnalysisResult> {
  if (!apiKey) throw new Error("OpenAI API Key is missing");

  const prompt = `
    Analyze this image for a high-end professional scenic design portfolio.
    The goal is "Supreme" quality—sophisticated, architectural, and artistically precise.

    ${
    context
      ? `\n🎭 CRITICAL CONTEXT (MUST USE THIS INFORMATION):
    Raw metadata: "${context}"
    
    PARSING INSTRUCTIONS:
    - Format is: "Production Title (Category) - Design by Designer Name"
    - Example: "Angel Street (Scenic Design) - Design by Brandon PT Davis"
    - Extract PRODUCTION TITLE: everything before the first "("
    - Extract DESIGNER NAME: everything after "Design by"
    
    MANDATORY REQUIREMENTS:
    ✓ You MUST include the production title in EVERY output field
    ✓ You MUST include the designer name in altText and caption if available
    ✓ Use natural phrasing: "Brandon PT Davis's design for 'Angel Street'" or "The set for 'Angel Street' by Brandon PT Davis"
    
    ❌ BAD: "A brick wall with platforms"
    ✅ GOOD: "Brandon PT Davis's design for 'Angel Street' features a distressed brick wall with steel platforms"
    `
      : ""
  }

    Provide the following in JSON format:
    1. "altText": A descriptive sentence (max 140 chars) that MUST include production name and designer name if provided.
       - Format: "[Designer]'s design for '[Production]' features [scenic elements]"
       - OR: "The set for '[Production]' by [Designer] features [scenic elements]"
       - **PRIORITIZE SCENIC ELEMENTS**: physical structures, materials, and colors FIRST.
       - Example: "Brandon PT Davis's design for 'Angel Street' features a distressed red brick wall and angular steel platforms, accented by cool blue sidelight."
    2. "caption": A sophisticated, curator-level caption (2-3 sentences) that includes production name, designer, and design analysis.
       - **FOCUS**: 70% Scenic/Architecture/Color, 30% Lighting/Mood.
       - Describe *specific* colors (e.g., "oxidized copper", "deep crimson") and textures.
       - Analyze the *intent* of the design.
    3. "tags": Array of 8-12 relevant tags including production name and designer name as separate tags.
    4. "seoDescription": A compelling meta description (150-160 chars) that includes production name and designer.
       - Example: "Expressionist scenic design by Brandon PT Davis for 'Angel Street' featuring angular structural elements and high-contrast lighting."
  `;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
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
                  "detail": "low", // Low detail is cheaper and usually sufficient for alt text
                },
              },
            ],
          },
        ],
        max_tokens: 300,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to analyze image");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content) as AIAnalysisResult;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
}

// Helper to manage the API Key
export const AI_KEY_STORAGE = "brandon_ai_key";

export function getAIKey(): string | null {
  return localStorage.getItem(AI_KEY_STORAGE);
}

export function setAIKey(key: string) {
  localStorage.setItem(AI_KEY_STORAGE, key);
}
