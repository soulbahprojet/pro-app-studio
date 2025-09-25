import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenRequest {
  platform: 'web' | 'android' | 'ios';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      const { platform }: TokenRequest = await req.json();
      
      console.log('Mapbox token requested for platform:', platform);

      // Get appropriate token based on platform
      let token: string | undefined;
      
      switch (platform) {
        case 'web':
          token = Deno.env.get('MAPBOX_ACCESS_TOKEN_WEB');
          break;
        case 'android':
          token = Deno.env.get('MAPBOX_ACCESS_TOKEN_ANDROID');
          break;
        case 'ios':
          token = Deno.env.get('MAPBOX_ACCESS_TOKEN_IOS');
          break;
        default:
          return new Response(
            JSON.stringify({ error: 'Invalid platform specified' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
      }

      if (!token) {
        console.error(`No Mapbox token configured for platform: ${platform}`);
        return new Response(
          JSON.stringify({ error: 'Token not configured for this platform' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          token,
          platform,
          success: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Mapbox token service error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});