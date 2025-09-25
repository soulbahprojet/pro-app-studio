import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LocationUpdate {
  id: string;
  type: 'livreur' | 'taxi' | 'transitaire' | 'client' | 'vendeur';
  lat: number;
  lng: number;
  status: string;
  timestamp: number;
  user_id?: string;
  order_id?: string;
}

// Store active connections
const activeConnections = new Map<string, WebSocket>();

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  console.log('🚀 New WebSocket connection for 224Solutions real-time tracking');

  const { socket, response } = Deno.upgradeWebSocket(req);
  const connectionId = crypto.randomUUID();

  // Initialize Supabase client
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  socket.onopen = () => {
    console.log(`✅ Connection ${connectionId} opened`);
    activeConnections.set(connectionId, socket);
    
    // Send initial connection confirmation
    socket.send(JSON.stringify({
      type: 'connection_established',
      connectionId,
      timestamp: Date.now(),
      message: '224Solutions Real-time Tracking Connected'
    }));

    // Send current active services
    sendCurrentServices(socket, supabaseClient);
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('📨 Received message:', message);

      switch (message.type) {
        case 'location_update':
          await handleLocationUpdate(message.data, supabaseClient);
          break;
        
        case 'subscribe_to_services':
          await subscribeToServices(socket, message.services || [], supabaseClient);
          break;
        
        case 'get_route':
          await calculateAndSendRoute(socket, message.data, supabaseClient);
          break;
        
        case 'ping':
          socket.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;

        default:
          console.log('❓ Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('❌ Error processing message:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message',
        timestamp: Date.now()
      }));
    }
  };

  socket.onclose = () => {
    console.log(`🔌 Connection ${connectionId} closed`);
    activeConnections.delete(connectionId);
  };

  socket.onerror = (error) => {
    console.error(`❌ WebSocket error for ${connectionId}:`, error);
    activeConnections.delete(connectionId);
  };

  return response;
});

async function sendCurrentServices(socket: WebSocket, supabase: any) {
  try {
    // Get active GPS tracking data
    const { data: trackingData, error } = await supabase
      .from('gps_tracking')
      .select(`
        *,
        profiles!gps_tracking_user_id_fkey(readable_id, full_name, role)
      `)
      .eq('is_active', true)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching tracking data:', error);
      return;
    }

    const services = trackingData.map((track: any) => ({
      id: track.user_id,
      type: mapRoleToServiceType(track.profiles?.role),
      lat: track.latitude,
      lng: track.longitude,
      status: 'active',
      timestamp: new Date(track.timestamp).getTime(),
      name: track.profiles?.readable_id || 'Service',
      user_id: track.user_id,
      order_id: track.order_id
    }));

    socket.send(JSON.stringify({
      type: 'services_update',
      data: services,
      timestamp: Date.now()
    }));

    console.log(`📍 Sent ${services.length} active services to client`);
  } catch (error) {
    console.error('Error sending current services:', error);
  }
}

async function handleLocationUpdate(locationData: LocationUpdate, supabase: any) {
  try {
    // Update GPS tracking in database
    const { error } = await supabase
      .from('gps_tracking')
      .insert({
        user_id: locationData.user_id,
        order_id: locationData.order_id,
        latitude: locationData.lat,
        longitude: locationData.lng,
        timestamp: new Date().toISOString(),
        is_active: true
      });

    if (error) {
      console.error('Error updating location:', error);
      return;
    }

    // Broadcast to all connected clients
    const updateMessage = {
      type: 'location_updated',
      data: locationData,
      timestamp: Date.now()
    };

    broadcastToAllClients(updateMessage);
    console.log(`📡 Location update broadcasted for service: ${locationData.type}`);
  } catch (error) {
    console.error('Error handling location update:', error);
  }
}

async function subscribeToServices(socket: WebSocket, services: string[], supabase: any) {
  try {
    // Send filtered services based on subscription
    const { data: trackingData, error } = await supabase
      .from('gps_tracking')
      .select(`
        *,
        profiles!gps_tracking_user_id_fkey(readable_id, full_name, role)
      `)
      .eq('is_active', true)
      .in('profiles.role', services.length > 0 ? services : ['courier', 'taxi_moto', 'seller', 'client']);

    if (!error && trackingData) {
      const filteredServices = trackingData.map((track: any) => ({
        id: track.user_id,
        type: mapRoleToServiceType(track.profiles?.role),
        lat: track.latitude,
        lng: track.longitude,
        status: 'active',
        timestamp: new Date(track.timestamp).getTime(),
        name: track.profiles?.readable_id || 'Service'
      }));

      socket.send(JSON.stringify({
        type: 'subscription_update',
        data: filteredServices,
        subscribed_services: services,
        timestamp: Date.now()
      }));
    }
  } catch (error) {
    console.error('Error handling service subscription:', error);
  }
}

async function calculateAndSendRoute(socket: WebSocket, routeData: any, supabase: any) {
  try {
    const { start, end } = routeData;
    
    // Get Mapbox token
    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN_WEB');
    if (!mapboxToken) {
      throw new Error('Mapbox token not configured');
    }

    // Calculate route using Mapbox Directions API
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxToken}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      
      socket.send(JSON.stringify({
        type: 'route_calculated',
        data: {
          geometry: route.geometry,
          distance: route.distance,
          duration: route.duration,
          start,
          end
        },
        timestamp: Date.now()
      }));

      console.log(`🗺️ Route calculated: ${(route.distance / 1000).toFixed(1)}km, ${Math.round(route.duration / 60)}min`);
    }
  } catch (error) {
    console.error('Error calculating route:', error);
    socket.send(JSON.stringify({
      type: 'route_error',
      message: 'Failed to calculate route',
      timestamp: Date.now()
    }));
  }
}

function broadcastToAllClients(message: any) {
  const messageStr = JSON.stringify(message);
  let successCount = 0;
  let failCount = 0;

  activeConnections.forEach((socket, connectionId) => {
    try {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(messageStr);
        successCount++;
      } else {
        activeConnections.delete(connectionId);
        failCount++;
      }
    } catch (error) {
      console.error(`Error sending to connection ${connectionId}:`, error);
      activeConnections.delete(connectionId);
      failCount++;
    }
  });

  console.log(`📡 Broadcast complete: ${successCount} sent, ${failCount} failed`);
}

function mapRoleToServiceType(role: string): string {
  const roleMapping: { [key: string]: string } = {
    'courier': 'livreur',
    'taxi_moto': 'taxi',
    'freight_forwarder': 'transitaire',
    'transitaire': 'transitaire',
    'seller': 'vendeur',
    'client': 'client'
  };
  
  return roleMapping[role] || 'client';
}