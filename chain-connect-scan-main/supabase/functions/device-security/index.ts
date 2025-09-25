import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
}

interface RemoteCommandData {
  command: 'block_device' | 'wipe_data' | 'force_logout';
  device_id: string;
  reason?: string;
}

interface EmergencyAlertData {
  location: LocationData;
  message: string;
  emergency_type: 'theft' | 'lost' | 'suspicious_activity';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    const { action, data } = await req.json()

    let result;
    switch (action) {
      case 'track_location':
        result = await handleLocationTracking(supabase, user.id, data as LocationData)
        break
      case 'remote_command':
        result = await handleRemoteCommand(supabase, user.id, data as RemoteCommandData)
        break
      case 'emergency_alert':
        result = await handleEmergencyAlert(supabase, user.id, data as EmergencyAlertData)
        break
      default:
        throw new Error('Invalid action')
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Device security error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

async function handleLocationTracking(
  supabase: any, 
  userId: string, 
  locationData: LocationData
) {
  // Store location in security tracking
  const { error: trackingError } = await supabase
    .from('security_tracking')
    .insert({
      user_id: userId,
      device_id: 'device_' + userId,
      ip_address: '0.0.0.0', // Would be real IP in production
      location: {
        lat: locationData.lat,
        lng: locationData.lng,
        accuracy: locationData.accuracy,
        timestamp: locationData.timestamp,
        address: await getAddressFromCoordinates(locationData.lat, locationData.lng)
      },
      action_type: 'location_update',
      details: {
        manual_track: true,
        accuracy: locationData.accuracy
      }
    })

  if (trackingError) {
    throw new Error('Failed to store location data')
  }

  // Check for unusual location patterns
  await checkLocationAlerts(supabase, userId, locationData)

  return { message: 'Location tracked successfully' }
}

async function handleRemoteCommand(
  supabase: any, 
  userId: string, 
  commandData: RemoteCommandData
) {
  // Store the command in the database
  const { error: commandError } = await supabase
    .from('remote_security_commands')
    .insert({
      target_user_id: userId,
      target_device_id: commandData.device_id,
      command_type: commandData.command,
      status: 'pending',
      created_by: userId
    })

  if (commandError) {
    throw new Error('Failed to create remote command')
  }

  // Execute immediate actions based on command type
  switch (commandData.command) {
    case 'block_device':
      // Mark device as blocked in device_security table
      await supabase
        .from('device_security')
        .upsert({
          user_id: userId,
          device_imei: commandData.device_id,
          is_blocked: true,
          blocked_reason: commandData.reason || 'Security remote command',
          blocked_at: new Date().toISOString()
        })
      break

    case 'wipe_data':
      // Mark for data wipe
      await supabase
        .from('device_security')
        .upsert({
          user_id: userId,
          device_imei: commandData.device_id,
          security_status: 'wipe_pending',
          data_wiped_at: new Date().toISOString()
        })
      break

    case 'force_logout':
      // This would typically invalidate sessions in your auth system
      console.log(`Force logout requested for device ${commandData.device_id}`)
      break
  }

  // Create security alert
  await supabase
    .from('security_alerts')
    .insert({
      alert_type: 'remote_command_executed',
      severity: 'high',
      user_id: userId,
      description: `Remote command ${commandData.command} executed on device ${commandData.device_id}`,
      metadata: {
        command: commandData.command,
        device_id: commandData.device_id,
        reason: commandData.reason
      },
      auto_action_taken: commandData.command
    })

  return { 
    message: `Remote command ${commandData.command} executed successfully`,
    command: commandData.command,
    device_id: commandData.device_id
  }
}

async function handleEmergencyAlert(
  supabase: any, 
  userId: string, 
  alertData: EmergencyAlertData
) {
  // Store emergency location
  await supabase
    .from('security_tracking')
    .insert({
      user_id: userId,
      device_id: 'emergency_' + userId,
      location: {
        lat: alertData.location.lat,
        lng: alertData.location.lng,
        timestamp: alertData.location.timestamp,
        emergency: true,
        type: alertData.emergency_type
      },
      action_type: 'emergency_alert',
      details: {
        message: alertData.message,
        emergency_type: alertData.emergency_type
      },
      risk_score: 100
    })

  // Create critical security alert
  await supabase
    .from('security_alerts')
    .insert({
      alert_type: 'emergency_alert',
      severity: 'critical',
      user_id: userId,
      description: `Emergency alert: ${alertData.emergency_type} - ${alertData.message}`,
      metadata: {
        location: alertData.location,
        emergency_type: alertData.emergency_type,
        message: alertData.message
      }
    })

  console.log(`EMERGENCY ALERT: User ${userId} - ${alertData.emergency_type} at ${alertData.location.lat},${alertData.location.lng}`)

  return { 
    message: 'Emergency alert processed successfully',
    alert_id: 'emergency_' + Date.now()
  }
}

// Helper function to check for unusual location patterns
async function checkLocationAlerts(
  supabase: any, 
  userId: string, 
  currentLocation: LocationData
) {
  // Get recent locations for this user
  const { data: recentLocations } = await supabase
    .from('security_tracking')
    .select('location')
    .eq('user_id', userId)
    .eq('action_type', 'location_update')
    .order('created_at', { ascending: false })
    .limit(10)

  if (recentLocations && recentLocations.length > 5) {
    // Calculate average location (simple implementation)
    const avgLat = recentLocations.reduce((sum: number, loc: any) => 
      sum + (loc.location?.lat || 0), 0) / recentLocations.length
    const avgLng = recentLocations.reduce((sum: number, loc: any) => 
      sum + (loc.location?.lng || 0), 0) / recentLocations.length

    // Calculate distance from usual location
    const distance = calculateDistance(
      currentLocation.lat, 
      currentLocation.lng, 
      avgLat, 
      avgLng
    )

    // If more than 50km from usual area, create alert
    if (distance > 50) {
      await supabase
        .from('security_alerts')
        .insert({
          alert_type: 'location_unusual',
          severity: 'medium',
          user_id: userId,
          description: `Unusual location detected: ${distance.toFixed(2)}km from usual area`,
          metadata: {
            current_location: currentLocation,
            usual_location: { lat: avgLat, lng: avgLng },
            distance_km: distance
          }
        })
    }
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Helper function to get address from coordinates (mock implementation)
async function getAddressFromCoordinates(lat: number, lng: number): Promise<string> {
  // In production, this would use a real geocoding service
  return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
}