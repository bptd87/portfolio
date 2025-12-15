
export interface AIAnalysisResult {
  altText: string;
  caption: string;
  tags: string[];
  seoDescription: string;
}

export async function analyzeImageWithOpenAI(imageUrl: string, apiKey: string, context?: string): Promise<AIAnalysisResult> {
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
    3. "tags": An array of 5-8 specific industry keywords (e.g., "forced perspective", "raked stage", "scrim", "cyclorama", "unit set", "immersive").
    4. "seoDescription": A compelling, expert-level meta description (150-160 chars).
       - Focus on the *design narrative* and *artistic value*.
       - Example: "Expressionist scenic design for 'Romero' featuring angular structural elements and high-contrast lighting to evoke a fragmented psychological state."
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
