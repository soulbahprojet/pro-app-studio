import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ message: "Méthode non autorisée ❌" }), 
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ message: "Token d'autorisation requis" }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Vérifier le rôle de l'utilisateur
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ message: "Token invalide" }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Vérifier le profil et les permissions
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || (profile.role !== 'pdg' && profile.role !== 'admin')) {
      return new Response(
        JSON.stringify({ message: "Permissions insuffisantes" }), 
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Simuler la restauration du système
    console.log("⏪ Lancement de la restauration du système...");
    
    // Ici, vous pouvez déclencher votre script de rollback
    // Par exemple : await exec("sh rollback.sh");
    // Ou appeler une API de rollback CI/CD
    
    // Log de l'action
    await supabase
      .from('system_logs')
      .insert([{
        action: 'system_rollback',
        user_id: user.id,
        details: { timestamp: new Date().toISOString() },
        status: 'success'
      }]);

    return new Response(
      JSON.stringify({ message: "Ancien système restauré avec succès ⏪✅" }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (err) {
    console.error("Erreur lors de la restauration:", err);
    
    return new Response(
      JSON.stringify({ 
        message: "Erreur lors de la restauration ❌", 
        error: err.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});