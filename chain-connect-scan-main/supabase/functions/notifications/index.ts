import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  userId?: string;
  orderId?: string;
  title: string;
  message: string;
  type: string;
  data?: any;
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
      // Send notification
      const notification: NotificationPayload = await req.json();
      
      console.log('Sending notification:', notification);

      const { data: notificationData, error: notificationError } = await supabaseClient
        .from('push_notifications')
        .insert({
          user_id: notification.userId || user.id,
          order_id: notification.orderId || null,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          data: notification.data || {},
        })
        .select()
        .single();

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        return new Response(
          JSON.stringify({ error: 'Failed to send notification' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data: notificationData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (req.method === 'GET') {
      // Get notifications for user
      const url = new URL(req.url);
      const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
      const limit = parseInt(url.searchParams.get('limit') || '20');
      
      let query = supabaseClient
        .from('push_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data: notifications, error: notificationsError } = await query;

      if (notificationsError) {
        console.error('Error fetching notifications:', notificationsError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch notifications' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data: notifications }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (req.method === 'PATCH') {
      // Mark notifications as read
      const { notificationIds } = await req.json();
      
      const { error: updateError } = await supabaseClient
        .from('push_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', notificationIds)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating notifications:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to mark notifications as read' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Notifications error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});