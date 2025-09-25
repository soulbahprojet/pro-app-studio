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
    // Créer le client Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { tracking_code } = await req.json();

    // Validation du code de suivi
    if (!tracking_code) {
      return new Response(JSON.stringify({ error: "Tracking code is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Récupérer les informations de l'expédition
    const { data: shipment, error: shipmentError } = await supabaseClient
      .from("shipments")
      .select("*")
      .eq("tracking_code", tracking_code)
      .single();

    if (shipmentError || !shipment) {
      return new Response(JSON.stringify({ 
        error: "Shipment not found",
        message: "Aucune expédition trouvée avec ce code de suivi"
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Récupérer l'historique de suivi
    const { data: tracking, error: trackingError } = await supabaseClient
      .from("shipment_tracking")
      .select("*")
      .eq("shipment_id", shipment.id)
      .order("timestamp", { ascending: false });

    if (trackingError) {
      console.error("Error fetching tracking:", trackingError);
      return new Response(JSON.stringify({ error: "Failed to fetch tracking history" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Formater la réponse
    const response = {
      tracking_code: shipment.tracking_code,
      status: shipment.status,
      origin: shipment.origin,
      destination: shipment.destination,
      weight: shipment.weight,
      dimensions: shipment.dimensions,
      service_type: shipment.service_type,
      price: shipment.price,
      currency: shipment.currency,
      created_at: shipment.created_at,
      updated_at: shipment.updated_at,
      history: tracking.map(entry => ({
        date: entry.timestamp,
        location: entry.location,
        status: entry.status,
        notes: entry.notes
      }))
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in track-shipment:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});