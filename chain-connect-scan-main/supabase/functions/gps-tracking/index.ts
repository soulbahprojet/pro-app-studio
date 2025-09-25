import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LocationUpdate {
  orderId?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  altitude?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST') {
      // Update GPS position
      const locationData: LocationUpdate = await req.json();
      
      console.log('Updating GPS position for user:', user.id, locationData);

      // Insert new GPS tracking entry
      const { data: gpsData, error: gpsError } = await supabaseClient
        .from('gps_tracking')
        .insert({
          user_id: user.id,
          order_id: locationData.orderId || null,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
          speed: locationData.speed,
          heading: locationData.heading,
          altitude: locationData.altitude,
          timestamp: new Date().toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (gpsError) {
        console.error('Error inserting GPS data:', gpsError);
        return new Response(
          JSON.stringify({ error: 'Failed to update location' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // If order is specified, send notifications to interested parties
      if (locationData.orderId) {
        // Get order details to find who should receive notifications
        const { data: order } = await supabaseClient
          .from('orders')
          .select('id, customer_id, seller_id, courier_id, readable_id')
          .eq('id', locationData.orderId)
          .single();

        if (order) {
          const notifications = [];
          
          // Notify customer
          if (order.customer_id !== user.id) {
            notifications.push({
              user_id: order.customer_id,
              order_id: order.id,
              title: 'Position mise à jour',
              message: `Votre livreur se déplace vers vous (Commande ${order.readable_id})`,
              type: 'position_update',
              data: { latitude: locationData.latitude, longitude: locationData.longitude }
            });
          }

          // Notify seller
          if (order.seller_id !== user.id) {
            notifications.push({
              user_id: order.seller_id,
              order_id: order.id,
              title: 'Suivi livraison',
              message: `Position du livreur mise à jour (Commande ${order.readable_id})`,
              type: 'position_update', 
              data: { latitude: locationData.latitude, longitude: locationData.longitude }
            });
          }

          // Insert notifications
          if (notifications.length > 0) {
            await supabaseClient
              .from('push_notifications')
              .insert(notifications);
          }
        }
      }

      // Deactivate old GPS entries for this user
      await supabaseClient
        .from('gps_tracking')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .neq('id', gpsData.id);

      return new Response(
        JSON.stringify({ success: true, data: gpsData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (req.method === 'GET') {
      // Get GPS tracking data
      const url = new URL(req.url);
      const orderId = url.searchParams.get('orderId');
      const userId = url.searchParams.get('userId');
      
      let query = supabaseClient
        .from('gps_tracking')
        .select(`
          *,
          profiles!gps_tracking_user_id_fkey(readable_id, full_name, role)
        `)
        .eq('is_active', true)
        .order('timestamp', { ascending: false });

      if (orderId) {
        query = query.eq('order_id', orderId);
      }
      
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: trackingData, error: trackingError } = await query;

      if (trackingError) {
        console.error('Error fetching GPS data:', trackingError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch tracking data' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data: trackingData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('GPS tracking error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});