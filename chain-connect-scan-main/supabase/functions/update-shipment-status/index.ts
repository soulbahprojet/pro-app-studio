import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    // Créer le client Supabase avec la clé de service
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Vérifier l'authentification de l'utilisateur et son rôle
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization header required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Vérifier si l'utilisateur est un transitaire ou admin
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("user_id", userData.user.id)
      .single();

    if (!profile || !["transitaire", "admin"].includes(profile.role)) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { tracking_code, status, location, notes } = await req.json();

    // Validation des données
    if (!tracking_code || !status || !location) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validation du statut
    const validStatuses = ["Créé", "En transit", "Livré", "Annulé"];
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({ error: "Invalid status" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Récupérer l'expédition
    const { data: shipment, error: shipmentError } = await supabaseClient
      .from("shipments")
      .select("*")
      .eq("tracking_code", tracking_code)
      .single();

    if (shipmentError || !shipment) {
      return new Response(JSON.stringify({ error: "Shipment not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mettre à jour le statut de l'expédition
    const { error: updateError } = await supabaseClient
      .from("shipments")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("tracking_code", tracking_code);

    if (updateError) {
      console.error("Error updating shipment:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update shipment" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ajouter une entrée de suivi
    const { error: trackingError } = await supabaseClient
      .from("shipment_tracking")
      .insert({
        shipment_id: shipment.id,
        location,
        status,
        notes: notes || null
      });

    if (trackingError) {
      console.error("Error creating tracking entry:", trackingError);
    }

    // Envoyer une notification à l'utilisateur
    let notificationMessage = "";
    switch (status) {
      case "En transit":
        notificationMessage = `Votre colis ${tracking_code} est en transit depuis ${location}`;
        break;
      case "Livré":
        notificationMessage = `Votre colis ${tracking_code} a été livré à ${location}`;
        break;
      case "Annulé":
        notificationMessage = `Votre colis ${tracking_code} a été annulé`;
        break;
      default:
        notificationMessage = `Mise à jour de votre colis ${tracking_code}: ${status}`;
    }

    await supabaseClient
      .from("push_notifications")
      .insert({
        user_id: shipment.user_id,
        title: "Mise à jour d'expédition",
        message: notificationMessage,
        type: "shipment_update",
        data: { 
          shipment_id: shipment.id, 
          tracking_code: tracking_code,
          status: status,
          location: location
        }
      });

    return new Response(JSON.stringify({
      success: true,
      message: "Shipment status updated successfully",
      tracking_code: tracking_code,
      status: status,
      location: location
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in update-shipment-status:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});