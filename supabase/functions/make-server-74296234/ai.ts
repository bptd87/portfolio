
export async function analyzeImageWithOpenAI(imageUrl: string, apiKey: string) {
  const systemPrompt = "You are a professional scenic designer and archivist. Analyze this image and provide a concise, professional caption suitable for a design portfolio. Focus on the architectural elements, lighting mood, and scenic composition. Do not start with 'Image of' or 'A photo of'. Return ONLY the caption text.";
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Describe this scenic design image for my portfolio alt text.' },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 100,
    })
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.choices[0].message.content.trim();
}
