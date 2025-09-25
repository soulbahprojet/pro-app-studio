import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function pour calculer le prix d'expédition
function calculateShippingPrice(weight: number, dimensions: any, serviceType: string, country: string) {
  let basePrice = 50; // Prix de base en USD
  let weightFee = weight * 10; // 10$ par kg
  let volume = (dimensions.length * dimensions.height * dimensions.width) / 5000; // conversion cm3 en kg volumétrique
  let volumeFee = volume * 8; // 8$ par kg volumétrique

  let serviceMultiplier = serviceType === "Express" ? 1.5 : serviceType === "Priority" ? 2.0 : 1.0;
  let countryMultiplier = country.toLowerCase().includes("usa") ? 1.2 : 
                         country.toLowerCase().includes("europe") ? 1.1 : 1.0;

  return Math.round((basePrice + weightFee + volumeFee) * serviceMultiplier * countryMultiplier * 100) / 100;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    // Créer le client Supabase avec la clé de service pour bypass RLS si nécessaire
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Vérifier l'authentification de l'utilisateur
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

    const user = userData.user;
    const { origin, destination, weight, dimensions, service_type } = await req.json();

    // Validation des données
    if (!origin || !destination || !weight || !dimensions || !service_type) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validation du type de service
    if (!["Standard", "Express", "Priority"].includes(service_type)) {
      return new Response(JSON.stringify({ error: "Invalid service type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculer le prix
    const price = calculateShippingPrice(weight, dimensions, service_type, destination);

    // Créer l'expédition dans la base de données
    const { data: shipment, error: shipmentError } = await supabaseClient
      .from("shipments")
      .insert({
        user_id: user.id,
        origin,
        destination,
        weight,
        dimensions,
        service_type,
        price,
        status: "Créé"
      })
      .select()
      .single();

    if (shipmentError) {
      console.error("Error creating shipment:", shipmentError);
      return new Response(JSON.stringify({ error: "Failed to create shipment" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Créer l'entrée de suivi initiale
    await supabaseClient
      .from("shipment_tracking")
      .insert({
        shipment_id: shipment.id,
        location: origin,
        status: "Pris en charge",
        notes: "Colis créé et pris en charge"
      });

    // Créer une notification pour l'utilisateur
    await supabaseClient
      .from("push_notifications")
      .insert({
        user_id: user.id,
        title: "Expédition créée",
        message: `Votre colis ${shipment.tracking_code} a été créé avec succès`,
        type: "shipment_created",
        data: { shipment_id: shipment.id, tracking_code: shipment.tracking_code }
      });

    return new Response(JSON.stringify({
      success: true,
      tracking_code: shipment.tracking_code,
      price: shipment.price,
      status: shipment.status,
      shipment_id: shipment.id
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in create-shipment:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});