import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DirectionsRequest {
  start: [number, number];
  end: [number, number];
  profile?: 'driving' | 'walking' | 'cycling';
  language?: string;
  alternatives?: boolean;
  steps?: boolean;
  geometries?: 'geojson' | 'polyline' | 'polyline6';
}

interface DirectionsResponse {
  distance: number;
  duration: number;
  steps: any[];
  polyline: string;
  geometry: any;
  route: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      const { 
        start, 
        end, 
        profile = 'driving',
        language = 'fr',
        alternatives = false,
        steps = true,
        geometries = 'geojson'
      }: DirectionsRequest = await req.json();

      // Validate inputs
      if (!start || !end || !Array.isArray(start) || !Array.isArray(end)) {
        return new Response(
          JSON.stringify({ error: 'Start and end coordinates are required as [lng, lat] arrays' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (start.length !== 2 || end.length !== 2) {
        return new Response(
          JSON.stringify({ error: 'Coordinates must be [longitude, latitude] arrays' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get Mapbox access token from environment
      const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN_WEB');
      if (!mapboxToken) {
        console.error('MAPBOX_ACCESS_TOKEN_WEB not configured');
        return new Response(
          JSON.stringify({ error: 'Mapbox configuration error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Build Mapbox Directions API URL
      const coordinates = `${start[0]},${start[1]};${end[0]},${end[1]}`;
      const params = new URLSearchParams({
        access_token: mapboxToken,
        geometries: geometries,
        language: language,
        steps: steps.toString(),
        alternatives: alternatives.toString()
      });

      const mapboxUrl = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}?${params}`;

      console.log('Calling Mapbox Directions API:', mapboxUrl.replace(mapboxToken, '***'));

      // Call Mapbox Directions API
      const mapboxResponse = await fetch(mapboxUrl);
      
      if (!mapboxResponse.ok) {
        const errorText = await mapboxResponse.text();
        console.error('Mapbox API error:', mapboxResponse.status, errorText);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to get directions from Mapbox',
            details: errorText 
          }),
          { status: mapboxResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const mapboxData = await mapboxResponse.json();

      if (!mapboxData.routes || mapboxData.routes.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No routes found between the specified coordinates' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Extract the first route
      const route = mapboxData.routes[0];
      const leg = route.legs[0];

      // Prepare response in the requested format
      const response: DirectionsResponse = {
        distance: route.distance, // meters
        duration: route.duration, // seconds
        steps: leg?.steps || [],
        polyline: route.geometry?.coordinates ? 
          encodePolyline(route.geometry.coordinates) : '',
        geometry: route.geometry,
        route: route
      };

      console.log('Directions calculated successfully:', {
        distance: response.distance,
        duration: response.duration,
        steps: response.steps.length
      });

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Mapbox directions service error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Simple polyline encoding function for coordinates
function encodePolyline(coordinates: number[][]): string {
  if (!coordinates || coordinates.length === 0) return '';
  
  let encoded = '';
  let prevLat = 0;
  let prevLng = 0;

  for (const coord of coordinates) {
    const lng = Math.round(coord[0] * 1e5);
    const lat = Math.round(coord[1] * 1e5);

    const deltaLat = lat - prevLat;
    const deltaLng = lng - prevLng;

    encoded += encodeSignedNumber(deltaLat);
    encoded += encodeSignedNumber(deltaLng);

    prevLat = lat;
    prevLng = lng;
  }

  return encoded;
}

function encodeSignedNumber(num: number): string {
  let sgn_num = num << 1;
  if (num < 0) {
    sgn_num = ~sgn_num;
  }
  return encodeNumber(sgn_num);
}

function encodeNumber(num: number): string {
  let encoded = '';
  while (num >= 0x20) {
    encoded += String.fromCharCode((0x20 | (num & 0x1f)) + 63);
    num >>= 5;
  }
  encoded += String.fromCharCode(num + 63);
  return encoded;
}