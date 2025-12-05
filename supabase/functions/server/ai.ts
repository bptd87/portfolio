
export interface AIAnalysisResult {
  altText: string;
  caption: string;
  tags: string[];
  seoDescription: string;
}

export async function analyzeImageWithOpenAI(imageUrl: string, apiKey: string): Promise<AIAnalysisResult> {
  const prompt = `
    Analyze this image for a professional scenic design and theatre portfolio.
    
    Provide the following in JSON format:
    1. "altText": A concise, accessibility-focused description (max 125 chars). Describe the key visual content for someone using a screen reader.
    2. "caption": A professional, artistic caption describing the composition, lighting, mood, and design elements. Use terminology relevant to theatre and scenic design.
    3. "tags": An array of 5-8 specific keywords (e.g., "scenic design", "theatre architecture", "dramatic lighting", "period piece", "texture", "scale model").
    4. "seoDescription": A compelling meta description (150-160 characters) optimized for search engines. 
       - Focus on the *design intent* and *artistic value*.
       - Include keywords like "Scenic Design", "Theatre Production", or specific style terms.
       - Avoid generic phrases like "Explore this image...". 
       - Example: "Atmospheric scenic design featuring distressed wood textures and dramatic backlighting, creating a haunting mood for a production of Macbeth."
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o", // Vision capable model
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                "url": imageUrl,
                "detail": "low"
              }
            }
          ]
        }
      ],
      max_tokens: 300,
      response_format: { type: "json_object" }
    })
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`OpenAI Error: ${data.error.message}`);
  }

  const content = data.choices[0].message.content;
  try {
    return JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse OpenAI response:", content);
    throw new Error("Failed to parse AI response");
  }
}
