import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== OPENAI TEST FUNCTION CALLED ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    
    // Log all headers
    console.log('=== HEADERS ===');
    for (const [key, value] of req.headers.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    // Log body content
    let body = null;
    let bodyText = '';
    try {
      bodyText = await req.text();
      if (bodyText) {
        body = JSON.parse(bodyText);
        console.log('=== BODY ===');
        console.log(JSON.stringify(body, null, 2));
      } else {
        console.log('=== BODY === (empty)');
        // Default prompt if no body
        body = { prompt: "Hello from Supabase Edge Function!" };
      }
    } catch (bodyError) {
      console.log('=== BODY === (not JSON or error parsing)');
      console.log('Body error:', bodyError.message);
      console.log('Raw body text:', bodyText);
      // Default prompt if parsing failed
      body = { prompt: "Hello from Supabase Edge Function!" };
    }
    
    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not found in environment variables');
    }
    
    // Call OpenAI API
    console.log('=== CALLING OPENAI ===');
    console.log('Prompt:', body.prompt);
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant testing the API connection.' },
          { role: 'user', content: body.prompt || 'Hello!' }
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API Error:', errorText);
      throw new Error(`OpenAI API Error: ${openAIResponse.status} ${errorText}`);
    }

    const openAIData = await openAIResponse.json();
    const openAIText = openAIData.choices[0]?.message?.content || 'No response from OpenAI';
    
    console.log('=== OPENAI RESPONSE ===');
    console.log('Response:', openAIText);
    console.log('=== END DEBUG INFO ===');
    
    // Prepare response data
    const responseData = {
      ok: true,
      prompt: body.prompt || 'No prompt provided',
      openai_response: openAIText,
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
      body: body,
      rawBody: bodyText || null
    };
    
    return new Response(
      JSON.stringify(responseData, null, 2),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Error in ping-debug:', error);
    return new Response(
      JSON.stringify({ 
        ok: false,
        error: error.message,
        prompt: 'Error occurred before processing prompt'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});