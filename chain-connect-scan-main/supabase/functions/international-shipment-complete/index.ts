import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShipmentRequest {
  senderName: string;
  senderAddress: string;
  senderCity: string;
  senderCountry: string;
  senderPostalCode?: string;
  senderPhone?: string;
  senderEmail?: string;
  
  recipientName: string;
  recipientAddress: string;
  recipientCity: string;
  recipientCountry: string;
  recipientPostalCode?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  
  commodityType: string;
  commodityDescription?: string;
  commodityValue?: number;
  commodityCurrency?: string;
  isDangerousGoods?: boolean;
  isFragile?: boolean;
  
  serviceType: string;
  transportMode: string;
  
  insuranceRequired?: boolean;
  insuranceValue?: number;
  
  specialInstructions?: string;
  forwarderId?: string;
  estimatedCost?: any;
}

interface CostCalculationRequest {
  originCountry: string;
  destinationCountry: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  serviceType: string;
  transportMode: string;
  commodityValue?: number;
  insuranceRequired?: boolean;
}

interface TrackingRequest {
  trackingCode: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('Unauthorized');

    const { action, ...body } = await req.json();

    switch (action) {
      case 'calculateCost':
        return await handleCostCalculation(supabaseClient, body as CostCalculationRequest);
      
      case 'createShipment':
        return await handleCreateShipment(supabaseClient, user.id, body as ShipmentRequest);
      
      case 'trackShipment':
        return await handleTrackShipment(supabaseClient, body as TrackingRequest);
      
      case 'updateStatus':
        return await handleUpdateStatus(supabaseClient, user.id, body);
      
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in international-shipment-complete function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleCostCalculation(supabaseClient: any, request: CostCalculationRequest) {
  console.log('Calculating cost for:', request);

  // Calculate volumetric weight
  const volumetricWeight = (request.length * request.width * request.height) / 6000; // Air freight divisor
  const chargeableWeight = Math.max(request.weight, volumetricWeight);

  // Get shipping rates from database
  const { data: rates, error: ratesError } = await supabaseClient
    .from('shipping_rates_matrix')
    .select('*')
    .eq('origin_country', request.originCountry)
    .eq('destination_country', request.destinationCountry)
    .eq('transport_mode', request.transportMode)
    .eq('service_type', request.serviceType)
    .eq('is_active', true)
    .gte('weight_to_kg', chargeableWeight)
    .lte('weight_from_kg', chargeableWeight)
    .order('created_at', { ascending: false })
    .limit(1);

  if (ratesError) throw ratesError;

  let baseRate = 5; // Default rate per kg
  let fuelSurcharge = 0;
  let handlingFee = 0;
  let customsClearanceFee = 0;
  let securityFee = 0;
  let insuranceRate = 0.001;

  if (rates && rates.length > 0) {
    const rate = rates[0];
    baseRate = rate.base_rate_per_kg;
    fuelSurcharge = rate.fuel_surcharge_percentage || 0;
    handlingFee = rate.handling_fee || 0;
    customsClearanceFee = rate.customs_clearance_fee || 0;
    securityFee = rate.security_fee || 0;
    insuranceRate = rate.insurance_rate_percentage / 100 || 0.001;
  }

  // Calculate costs
  const shippingCost = Math.max(chargeableWeight * baseRate, 50); // Minimum $50
  const fuelSurchargeAmount = shippingCost * (fuelSurcharge / 100);
  const totalShippingCost = shippingCost + fuelSurchargeAmount + handlingFee + customsClearanceFee + securityFee;

  let insuranceCost = 0;
  if (request.insuranceRequired && request.commodityValue) {
    insuranceCost = Math.max(request.commodityValue * insuranceRate, 10); // Minimum $10
  }

  const totalCost = totalShippingCost + insuranceCost;

  // Mock available carriers based on transport mode
  const availableCarriers = [];
  if (request.transportMode === 'air') {
    availableCarriers.push(
      { name: 'DHL Express', service: 'Express Worldwide', estimatedDays: '2-4' },
      { name: 'FedEx International', service: 'Priority', estimatedDays: '3-5' },
      { name: 'UPS Worldwide', service: 'Express Plus', estimatedDays: '1-3' }
    );
  } else if (request.transportMode === 'sea') {
    availableCarriers.push(
      { name: 'Maersk Line', service: 'FCL', estimatedDays: '20-35' },
      { name: 'MSC', service: 'LCL', estimatedDays: '25-40' },
      { name: 'CMA CGM', service: 'Standard', estimatedDays: '30-45' }
    );
  }

  const result = {
    shippingCost: Math.round(totalShippingCost * 100) / 100,
    insuranceCost: Math.round(insuranceCost * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    chargeableWeight: Math.round(chargeableWeight * 100) / 100,
    volumetricWeight: Math.round(volumetricWeight * 100) / 100,
    availableCarriers,
    currency: 'USD',
    breakdown: {
      baseShipping: Math.round(shippingCost * 100) / 100,
      fuelSurcharge: Math.round(fuelSurchargeAmount * 100) / 100,
      handlingFee: Math.round(handlingFee * 100) / 100,
      customsClearance: Math.round(customsClearanceFee * 100) / 100,
      securityFee: Math.round(securityFee * 100) / 100
    }
  };

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleCreateShipment(supabaseClient: any, userId: string, request: ShipmentRequest) {
  console.log('Creating shipment for user:', userId);

  // Validate required fields
  if (!request.senderName || !request.recipientName || !request.weightKg) {
    throw new Error('Missing required fields');
  }

  // Create the shipment
  const shipmentData = {
    customer_id: userId,
    forwarder_id: request.forwarderId || null,
    
    // Sender info
    sender_name: request.senderName,
    sender_address: request.senderAddress,
    sender_city: request.senderCity,
    sender_country: request.senderCountry,
    sender_postal_code: request.senderPostalCode || null,
    sender_phone: request.senderPhone || null,
    sender_email: request.senderEmail || null,
    
    // Recipient info
    recipient_name: request.recipientName,
    recipient_address: request.recipientAddress,
    recipient_city: request.recipientCity,
    recipient_country: request.recipientCountry,
    recipient_postal_code: request.recipientPostalCode || null,
    recipient_phone: request.recipientPhone || null,
    recipient_email: request.recipientEmail || null,
    
    // Package details
    weight_kg: request.weightKg,
    length_cm: request.lengthCm,
    width_cm: request.widthCm,
    height_cm: request.heightCm,
    
    // Commodity
    commodity_type: request.commodityType,
    commodity_description: request.commodityDescription || null,
    commodity_value: request.commodityValue || null,
    commodity_currency: request.commodityCurrency || 'USD',
    is_dangerous_goods: request.isDangerousGoods || false,
    is_fragile: request.isFragile || false,
    
    // Service
    service_type: request.serviceType,
    transport_mode: request.transportMode,
    
    // Insurance
    insurance_required: request.insuranceRequired || false,
    insurance_value: request.insuranceValue || 0,
    
    // Costs from estimation
    shipping_cost: request.estimatedCost?.shippingCost || 0,
    insurance_cost: request.estimatedCost?.insuranceCost || 0,
    total_cost: request.estimatedCost?.totalCost || 0,
    
    // Additional
    special_instructions: request.specialInstructions || null,
    
    status: 'created'
  };

  const { data: shipment, error: shipmentError } = await supabaseClient
    .from('international_shipments_complete')
    .insert([shipmentData])
    .select()
    .single();

  if (shipmentError) throw shipmentError;

  // Create initial status history entry
  await supabaseClient
    .from('shipment_status_history')
    .insert([{
      shipment_id: shipment.id,
      status: 'created',
      location: `${request.senderCity}, ${request.senderCountry}`,
      notes: 'Expédition créée et enregistrée dans le système',
      automatic: true
    }]);

  // Create payment record if cost is available
  if (request.estimatedCost?.totalCost) {
    await supabaseClient
      .from('shipment_payments')
      .insert([{
        shipment_id: shipment.id,
        amount: request.estimatedCost.totalCost,
        currency: 'USD',
        payment_method: 'pending',
        payment_status: 'pending'
      }]);
  }

  // Trigger AI analysis for potential issues
  await triggerAIAnalysis(supabaseClient, shipment);

  return new Response(JSON.stringify({
    shipment,
    trackingCode: shipment.tracking_code,
    message: 'Expédition créée avec succès'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleTrackShipment(supabaseClient: any, request: TrackingRequest) {
  console.log('Tracking shipment:', request.trackingCode);

  // Get shipment details
  const { data: shipment, error: shipmentError } = await supabaseClient
    .from('international_shipments_complete')
    .select('*')
    .eq('tracking_code', request.trackingCode)
    .single();

  if (shipmentError || !shipment) {
    return new Response(JSON.stringify({
      shipment: null,
      message: 'Expédition non trouvée'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get status history
  const { data: statusHistory, error: historyError } = await supabaseClient
    .from('shipment_status_history')
    .select('*')
    .eq('shipment_id', shipment.id)
    .order('timestamp', { ascending: false });

  if (historyError) throw historyError;

  // Get customs documents
  const { data: documents, error: documentsError } = await supabaseClient
    .from('customs_documents_complete')
    .select('*')
    .eq('shipment_id', shipment.id);

  if (documentsError) throw documentsError;

  // Get alerts
  const { data: alerts, error: alertsError } = await supabaseClient
    .from('shipment_alerts')
    .select('*')
    .eq('shipment_id', shipment.id)
    .eq('status', 'active');

  if (alertsError) throw alertsError;

  return new Response(JSON.stringify({
    shipment,
    statusHistory: statusHistory || [],
    documents: documents || [],
    alerts: alerts || []
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleUpdateStatus(supabaseClient: any, userId: string, body: any) {
  const { shipmentId, status, location, notes, coordinates } = body;

  console.log('Updating status for shipment:', shipmentId);

  // Verify user has permission to update this shipment
  const { data: shipment, error: shipmentError } = await supabaseClient
    .from('international_shipments_complete')
    .select('*, freight_forwarder_profiles!forwarder_id(user_id)')
    .eq('id', shipmentId)
    .single();

  if (shipmentError) throw shipmentError;

  const isCustomer = shipment.customer_id === userId;
  const isForwarder = shipment.freight_forwarder_profiles?.user_id === userId;

  if (!isCustomer && !isForwarder) {
    throw new Error('Unauthorized to update this shipment');
  }

  // Update shipment status
  const updateData: any = {
    status,
    updated_at: new Date().toISOString()
  };

  if (coordinates) {
    updateData.current_location = coordinates;
    
    // Add to route history
    const routeHistory = shipment.route_history || [];
    routeHistory.push({
      ...coordinates,
      timestamp: new Date().toISOString(),
      location
    });
    updateData.route_history = routeHistory;
  }

  if (status === 'delivered') {
    updateData.actual_delivery_date = new Date().toISOString();
  }

  const { error: updateError } = await supabaseClient
    .from('international_shipments_complete')
    .update(updateData)
    .eq('id', shipmentId);

  if (updateError) throw updateError;

  // Add status history entry
  await supabaseClient
    .from('shipment_status_history')
    .insert([{
      shipment_id: shipmentId,
      status,
      location: location || '',
      notes: notes || null,
      updated_by: userId,
      automatic: false
    }]);

  // Trigger AI analysis for anomalies
  const updatedShipment = { ...shipment, ...updateData };
  await triggerAIAnalysis(supabaseClient, updatedShipment);

  return new Response(JSON.stringify({
    success: true,
    message: 'Statut mis à jour avec succès'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function triggerAIAnalysis(supabaseClient: any, shipment: any) {
  try {
    // Simple AI analysis logic
    const now = new Date();
    const createdAt = new Date(shipment.created_at);
    const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

    // Check for delays
    if (daysSinceCreation > 7 && shipment.status === 'created') {
      await supabaseClient
        .from('shipment_alerts')
        .insert([{
          shipment_id: shipment.id,
          alert_type: 'delay',
          severity: 'medium',
          title: 'Expédition non collectée',
          description: 'Cette expédition n\'a pas été collectée depuis plus de 7 jours',
          ai_analysis: {
            analysis: 'Délai inhabituel pour la collecte',
            recommendation: 'Contacter le transitaire pour vérifier le statut'
          },
          confidence_score: 0.8
        }]);
    }

    // Check for stuck shipments
    if (daysSinceCreation > 14 && !['delivered', 'exception'].includes(shipment.status)) {
      await supabaseClient
        .from('shipment_alerts')
        .insert([{
          shipment_id: shipment.id,
          alert_type: 'stuck',
          severity: 'high',
          title: 'Expédition bloquée',
          description: 'Cette expédition semble bloquée depuis plus de 14 jours',
          ai_analysis: {
            analysis: 'Expédition potentiellement bloquée en transit',
            recommendation: 'Investigation immédiate requise'
          },
          confidence_score: 0.9
        }]);
    }

    console.log('AI analysis completed for shipment:', shipment.id);
  } catch (error) {
    console.error('Error in AI analysis:', error);
    // Don't throw error here as it's not critical for the main operation
  }
}