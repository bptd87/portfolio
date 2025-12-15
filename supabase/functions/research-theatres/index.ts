import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { city, radius } = await req.json()

    if (!city) {
      throw new Error('City is required')
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    const systemPrompt = `You are a theatre research assistant. 
    Find 4-5 active professional or high-quality community theatres in or near ${city} (${radius} mile radius).
    For each, find the Artistic Director and Production Manager if public.
    Return strictly JSON in this format:
    [{ "name": "Theatre Name", "city": "City", "state": "State", "website": "url", "reason": "Why it's a match", "contacts": [{"role": "Artistic Director", "name": "Name", "email": "email or null"}] }]`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that outputs only valid JSON.' },
          { role: 'user', content: systemPrompt }
        ],
        temperature: 0.3,
      }),
    })

    const data = await response.json()
    const content = data.choices[0].message.content
    
    // Parse JSON from the response text (handling potential markdown code blocks)
    const jsonStr = content.replace(/```json\n|\n```/g, '').trim()
    const results = JSON.parse(jsonStr)

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
