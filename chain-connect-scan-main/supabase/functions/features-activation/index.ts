import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration complète des fonctionnalités par rôle
const FEATURES_BY_ROLE: Record<string, string[]> = {
  vendor: [
    'products',           // Gestion des produits
    'orders',             // Commandes reçues
    'wallet',             // Porte-feuille
    'subscription_basic', // Abonnement basic
    'subscription_standard', 
    'subscription_premium',
    'social_module',      // Réseau social
    'audio_video_calls',  // Appels audio/vidéo
    'dashboard',          // Tableau de bord
    'reports',            // Rapports
    'pos_system',         // Système de point de vente
    'analytics'           // Analyses
  ],
  client: [
    'orders', 
    'wallet', 
    'subscription_basic', 
    'subscription_standard', 
    'subscription_premium',
    'social_module', 
    'audio_video_calls',
    'dashboard',
    'marketplace',
    'favorites',
    'reviews'
  ],
  courier: [
    'deliveries', 
    'tracking', 
    'wallet', 
    'audio_video_calls',
    'dashboard',
    'gps_tracking',
    'earnings'
  ],
  forwarder: [
    'shipments', 
    'tracking', 
    'wallet', 
    'audio_video_calls',
    'dashboard',
    'international_freight',
    'customs_docs'
  ],
  transitaire: [
    'shipments', 
    'tracking', 
    'wallet', 
    'audio_video_calls',
    'dashboard',
    'international_freight', 
    'customs_docs'
  ],
  taxi_moto: [
    'rides', 
    'tracking', 
    'wallet', 
    'audio_video_calls',
    'dashboard',
    'gps_tracking', 
    'earnings'
  ],
  admin: [
    'all_features', 
    'system_management', 
    'user_management', 
    'analytics', 
    'security', 
    'configurations',
    'subscription_basic',
    'subscription_standard',
    'subscription_premium'
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Vérifier que c'est un utilisateur PDG
    const { data: adminRole } = await supabase
      .from('admin_roles')
      .select('role_type')
      .eq('user_id', user.id)
      .eq('role_type', 'pdg')
      .single();

    if (!adminRole) {
      return new Response(
        JSON.stringify({ error: 'Access denied. PDG role required.' }),
        { status: 403, headers: corsHeaders }
      );
    }

    const { action, role_filter } = await req.json();

    switch (action) {
      case 'activate_all_features':
        return await activateAllFeatures(supabase);
      
      case 'activate_role_features':
        return await activateRoleFeatures(supabase, role_filter);
      
      case 'get_features_status':
        return await getFeaturesStatus(supabase);
      
      case 'toggle_feature':
        const { role, feature, enabled } = await req.json();
        return await toggleFeature(supabase, role, feature, enabled);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: corsHeaders }
        );
    }

  } catch (error) {
    console.error('Error in features activation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function activateAllFeatures(supabase: any) {
  console.log('🚀 Starting activation of all features...');
  
  const results = {
    activated_features: 0,
    failed_features: 0,
    results_by_role: {} as Record<string, any>,
    errors: [] as string[]
  };

  try {
    for (const role of Object.keys(FEATURES_BY_ROLE)) {
      const features = FEATURES_BY_ROLE[role];
      console.log(`✅ Activating features for role: ${role}`);
      
      const roleResults = {
        role,
        total_features: features.length,
        activated: 0,
        failed: 0,
        features: [] as string[]
      };

      for (const feature of features) {
        try {
          const { error } = await supabase
            .from('user_features')
            .upsert(
              { 
                role, 
                feature, 
                enabled: true,
                updated_at: new Date().toISOString()
              },
              { 
                onConflict: 'role,feature',
                ignoreDuplicates: false 
              }
            );

          if (error) {
            console.error(`❌ Error for ${feature} in role ${role}:`, error.message);
            results.failed_features++;
            roleResults.failed++;
            results.errors.push(`${role}.${feature}: ${error.message}`);
          } else {
            console.log(`✔️ Feature activated: ${role}.${feature}`);
            results.activated_features++;
            roleResults.activated++;
            roleResults.features.push(feature);
          }
        } catch (err) {
          console.error(`❌ Exception for ${feature} in role ${role}:`, err);
          results.failed_features++;
          roleResults.failed++;
          results.errors.push(`${role}.${feature}: ${err.message || 'Unknown error'}`);
        }
      }

      results.results_by_role[role] = roleResults;
    }

    // Mettre à jour le statut d'activation système
    await supabase
      .from('system_configurations')
      .upsert({
        config_key: 'features_activation_status',
        config_value: {
          activated: true,
          last_activation: new Date().toISOString(),
          total_features: results.activated_features,
          activation_results: results.results_by_role
        },
        description: 'Statut activation des fonctionnalites systeme'
      }, { onConflict: 'config_key' });

    console.log('🎉 Features activation completed!');
    console.log(`✅ Successfully activated: ${results.activated_features} features`);
    console.log(`❌ Failed: ${results.failed_features} features`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Features activation completed',
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in activateAllFeatures:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        partial_results: results
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function activateRoleFeatures(supabase: any, targetRole: string) {
  if (!FEATURES_BY_ROLE[targetRole]) {
    return new Response(
      JSON.stringify({ error: `Unknown role: ${targetRole}` }),
      { status: 400, headers: corsHeaders }
    );
  }

  const features = FEATURES_BY_ROLE[targetRole];
  const results = {
    role: targetRole,
    activated: 0,
    failed: 0,
    features: [] as string[],
    errors: [] as string[]
  };

  for (const feature of features) {
    try {
      const { error } = await supabase
        .from('user_features')
        .upsert(
          { role: targetRole, feature, enabled: true },
          { onConflict: 'role,feature' }
        );

      if (error) {
        results.failed++;
        results.errors.push(`${feature}: ${error.message}`);
      } else {
        results.activated++;
        results.features.push(feature);
      }
    } catch (err) {
      results.failed++;
      results.errors.push(`${feature}: ${err.message || 'Unknown error'}`);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: `Features activation for ${targetRole} completed`,
      results
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getFeaturesStatus(supabase: any) {
  try {
    // Récupérer toutes les fonctionnalités activées
    const { data: features, error: featuresError } = await supabase
      .from('user_features')
      .select('*')
      .order('role', { ascending: true })
      .order('feature', { ascending: true });

    if (featuresError) {
      throw featuresError;
    }

    // Récupérer le statut d'activation système
    const { data: systemConfig } = await supabase
      .from('system_configurations')
      .select('config_value')
      .eq('config_key', 'features_activation_status')
      .single();

    // Organiser par rôle
    const featuresByRole = {} as Record<string, any[]>;
    const activationStats = {
      total_features: features?.length || 0,
      enabled_features: 0,
      disabled_features: 0,
      roles_configured: 0
    };

    if (features) {
      for (const feature of features) {
        if (!featuresByRole[feature.role]) {
          featuresByRole[feature.role] = [];
        }
        featuresByRole[feature.role].push(feature);
        
        if (feature.enabled) {
          activationStats.enabled_features++;
        } else {
          activationStats.disabled_features++;
        }
      }
    }

    activationStats.roles_configured = Object.keys(featuresByRole).length;

    return new Response(
      JSON.stringify({
        success: true,
        system_status: systemConfig?.config_value || { activated: false },
        features_by_role: featuresByRole,
        activation_stats: activationStats,
        available_roles: Object.keys(FEATURES_BY_ROLE),
        features_config: FEATURES_BY_ROLE
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

async function toggleFeature(supabase: any, role: string, feature: string, enabled: boolean) {
  try {
    const { error } = await supabase
      .from('user_features')
      .upsert(
        { role, feature, enabled, updated_at: new Date().toISOString() },
        { onConflict: 'role,feature' }
      );

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Feature ${feature} for role ${role} ${enabled ? 'enabled' : 'disabled'}`,
        feature: { role, feature, enabled }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}