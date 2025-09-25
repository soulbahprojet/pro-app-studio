import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

  let serviceMultiplier = 1.0;
  switch (serviceType) {
    case "Express":
      serviceMultiplier = 1.5;
      break;
    case "Priority":
      serviceMultiplier = 2.0;
      break;
    default:
      serviceMultiplier = 1.0;
  }

  let countryMultiplier = 1.0;
  const countryLower = country.toLowerCase();
  if (countryLower.includes("usa") || countryLower.includes("états-unis")) {
    countryMultiplier = 1.2;
  } else if (countryLower.includes("europe") || countryLower.includes("france") || countryLower.includes("allemagne")) {
    countryMultiplier = 1.1;
  } else if (countryLower.includes("asie") || countryLower.includes("chine") || countryLower.includes("japon")) {
    countryMultiplier = 1.3;
  }

  const totalPrice = (basePrice + weightFee + volumeFee) * serviceMultiplier * countryMultiplier;
  return Math.round(totalPrice * 100) / 100;
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
    const { weight, dimensions, service_type, destination } = await req.json();

    // Validation des données
    if (!weight || !dimensions || !service_type || !destination) {
      return new Response(JSON.stringify({ 
        error: "Missing required fields",
        required: ["weight", "dimensions", "service_type", "destination"]
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validation des dimensions
    if (!dimensions.length || !dimensions.height || !dimensions.width) {
      return new Response(JSON.stringify({ 
        error: "Invalid dimensions",
        required: "dimensions must include length, height, and width"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validation du type de service
    if (!["Standard", "Express", "Priority"].includes(service_type)) {
      return new Response(JSON.stringify({ 
        error: "Invalid service type",
        allowed: ["Standard", "Express", "Priority"]
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validation du poids
    if (weight <= 0 || weight > 1000) {
      return new Response(JSON.stringify({ 
        error: "Invalid weight",
        message: "Weight must be between 0.1 and 1000 kg"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculer le prix
    const price = calculateShippingPrice(weight, dimensions, service_type, destination);
    const volume = (dimensions.length * dimensions.height * dimensions.width) / 1000000; // en m³
    const volumetricWeight = (dimensions.length * dimensions.height * dimensions.width) / 5000; // en kg

    // Calculer les détails du prix pour transparence
    const breakdown = {
      base_price: 50,
      weight_fee: weight * 10,
      volume_fee: volumetricWeight * 8,
      service_multiplier: service_type === "Express" ? 1.5 : service_type === "Priority" ? 2.0 : 1.0,
      country_multiplier: destination.toLowerCase().includes("usa") ? 1.2 : 
                         destination.toLowerCase().includes("europe") ? 1.1 : 1.0
    };

    return new Response(JSON.stringify({
      price: price,
      currency: "USD",
      weight: weight,
      volumetric_weight: Math.round(volumetricWeight * 100) / 100,
      volume_m3: Math.round(volume * 1000000) / 1000000,
      service_type: service_type,
      destination: destination,
      breakdown: breakdown,
      estimated_delivery: {
        Standard: "7-14 jours ouvrables",
        Express: "3-5 jours ouvrables", 
        Priority: "1-3 jours ouvrables"
      }[service_type]
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in calculate-shipping-price:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});