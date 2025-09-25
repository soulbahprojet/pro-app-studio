import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AddBureauRequest {
  nom: string;
  email_president: string;
  ville: string;
}

interface AddTravailleurRequest {
  bureau_id: string;
  nom: string;
  email: string;
  telephone?: string;
  access_level: 'complet' | 'limite' | 'lecture_seule';
}

interface ResendLinkRequest {
  email: string;
  type: 'bureau' | 'travailleur';
}

const generateUniqueToken = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const sendEmail = async (to: string, subject: string, html: string) => {
  console.log(`Tentative d'envoi d'email vers: ${to}`);
  console.log(`Sujet: ${subject}`);
  
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY non configurée');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erreur Resend API:', response.status, errorText);
    throw new Error(`Erreur API Resend: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Email envoyé avec succès:', result);
  return result;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    console.log(`Action demandée: ${action}`);

    switch (action) {
      case 'add-bureau':
        return await addBureau(req);
      case 'add-travailleur':
        return await addTravailleur(req);
      case 'resend-link':
        return await resendLink(req);
      case 'test-email':
        return await testEmail(req);
      case 'get-bureaux':
        return await getBureaux(req);
      case 'get-travailleurs':
        return await getTravailleurs(req);
      case 'get-statistics':
        return await getStatistics(req);
      default:
        return new Response(JSON.stringify({ error: 'Action non reconnue' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Erreur dans syndicat-management:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

async function addBureau(req: Request) {
  const { nom, email_president, ville }: AddBureauRequest = await req.json();
  
  console.log('Création bureau avec données:', { nom, email_president, ville });
  
  // Vérifier la configuration Resend
  if (!resendApiKey) {
    console.error('RESEND_API_KEY non configurée dans les secrets Supabase');
    return new Response(JSON.stringify({ 
      error: 'Configuration email manquante - contactez l\'administrateur' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  const token = generateUniqueToken();
  // Générer l'URL correcte vers l'application Lovable
  const baseUrl = 'https://vuqauasbhkfozehfmkjt.lovableproject.com';
  const interface_url = `${baseUrl}/syndicat/bureau/${token}`;
  
  console.log('Token généré:', token);
  console.log('URL interface:', interface_url);

  // Vérifier si la table existe, sinon créer les données
  const { data: existingBureau, error: checkError } = await supabase
    .from('bureaux_syndicaux')
    .select('*')
    .eq('email_president', email_president)
    .maybeSingle();

  if (existingBureau) {
    console.log('Bureau existant trouvé, renvoi du lien:', existingBureau.interface_url);
    
    // Bureau existe déjà, renvoyer l'email avec le lien existant
    try {
      await sendEmail(
        email_president,
        `🔗 Votre lien d'accès au bureau syndical ${existingBureau.nom}`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Lien d'accès au Bureau Syndical</h1>
            <p>Bonjour,</p>
            <p>Voici votre lien permanent d'accès à votre bureau syndical <strong>${existingBureau.nom}</strong>:</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>🔗 Lien permanent d'accès :</h3>
              <a href="${existingBureau.interface_url}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Accéder à votre interface
              </a>
            </div>
            
            <p>Cordialement,<br>L'équipe de la Plateforme Syndicale</p>
          </div>
        `
      );
      
      console.log('Email de rappel envoyé avec succès pour bureau existant');
    } catch (emailError) {
      console.error('Erreur envoi email bureau existant:', emailError);
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      interface_url: existingBureau.interface_url,
      bureau: existingBureau,
      message: 'Lien renvoyé avec succès'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabase
    .from('bureaux_syndicaux')
    .insert({
      nom,
      email_president,
      ville,
      interface_url,
      token
    })
    .select()
    .single();

  if (error) {
    console.error('Erreur insertion bureau:', error);
    return new Response(JSON.stringify({ error: 'Erreur lors de la création du bureau' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Envoyer l'email avec le lien permanent
  try {
    console.log('Tentative d\'envoi d\'email à:', email_president);
    console.log('URL d\'interface générée:', interface_url);
    
    await sendEmail(
      email_president,
      `🏢 Votre bureau syndical ${nom} est prêt`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Bureau Syndical Activé</h1>
          <p>Bonjour,</p>
          <p>Votre bureau syndical <strong>${nom}</strong> à ${ville} est maintenant actif.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>🔗 Lien permanent d'accès :</h3>
            <a href="${interface_url}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accéder à votre interface
            </a>
            <p style="margin-top: 10px; font-size: 12px; color: #666;">
              Lien direct : ${interface_url}
            </p>
          </div>
          
          <p><strong>⚠️ Important :</strong> Conservez ce lien précieusement, il vous permettra d'accéder à votre interface de gestion à vie.</p>
          
          <h3>📋 Fonctionnalités disponibles :</h3>
          <ul>
            <li>✅ Gestion complète de vos travailleurs</li>
            <li>✅ Attribution des permissions individuelles</li>
            <li>✅ Enregistrement des motos</li>
            <li>✅ Système de notifications</li>
            <li>✅ Communication avec l'équipe technique</li>
          </ul>
          
          <p>Cordialement,<br>L'équipe de la Plateforme Syndicale</p>
        </div>
      `
    );
    
    console.log('Email envoyé avec succès');
  } catch (emailError) {
    console.error('Erreur détaillée lors de l\'envoi d\'email:', emailError);
    console.error('Type d\'erreur:', typeof emailError);
    console.error('Message d\'erreur:', emailError.message);
    // Ne pas faire échouer la création même si l'email échoue, mais logger l'erreur
  }

  return new Response(JSON.stringify({ 
    success: true, 
    interface_url,
    bureau: data
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function addTravailleur(req: Request) {
  const { bureau_id, nom, email, telephone, access_level }: AddTravailleurRequest = await req.json();
  
  const token = generateUniqueToken();
  // Générer l'URL correcte vers l'application Lovable
  const baseUrl = 'https://vuqauasbhkfozehfmkjt.lovableproject.com';
  const interface_url = `${baseUrl}/syndicat/travailleur/${token}`;

  const { data, error } = await supabase
    .from('travailleurs')
    .insert({
      bureau_id,
      nom,
      email,
      telephone,
      interface_url,
      token,
      access_level
    })
    .select()
    .single();

  if (error) {
    console.error('Erreur insertion travailleur:', error);
    return new Response(JSON.stringify({ error: 'Erreur lors de la création du travailleur' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Récupérer les infos du bureau
  const { data: bureau } = await supabase
    .from('bureaux_syndicaux')
    .select('nom')
    .eq('id', bureau_id)
    .single();

  // Envoyer l'email avec le lien permanent
  try {
    await sendEmail(
      email,
      `👷 Votre accès au bureau syndical ${bureau?.nom}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Accès Travailleur Activé</h1>
          <p>Bonjour <strong>${nom}</strong>,</p>
          <p>Vous avez été ajouté au bureau syndical <strong>${bureau?.nom}</strong>.</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h3>🔗 Votre lien permanent d'accès :</h3>
            <a href="${interface_url}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accéder à votre interface
            </a>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p><strong>🔒 Niveau d'accès :</strong> ${access_level}</p>
          </div>
          
          <p><strong>⚠️ Important :</strong> Conservez ce lien, il vous permettra d'accéder à votre interface à vie.</p>
          
          <h3>📋 Fonctionnalités disponibles :</h3>
          <ul>
            <li>✅ Enregistrement de vos motos</li>
            <li>✅ Réception des notifications</li>
            <li>✅ Communication avec votre bureau</li>
            <li>✅ Alertes importantes</li>
          </ul>
          
          <p>Cordialement,<br>L'équipe de la Plateforme Syndicale</p>
        </div>
      `
    );
  } catch (emailError) {
    console.error('Erreur envoi email travailleur:', emailError);
  }

  return new Response(JSON.stringify({ 
    success: true, 
    interface_url,
    travailleur: data
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function resendLink(req: Request) {
  const { email, type }: ResendLinkRequest = await req.json();
  
  const table = type === 'bureau' ? 'bureaux_syndicaux' : 'travailleurs';
  const emailField = type === 'bureau' ? 'email_president' : 'email';
  
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq(emailField, email)
    .maybeSingle();

  if (!data) {
    return new Response(JSON.stringify({ error: 'Utilisateur non trouvé' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Renvoyer l'email
  try {
    await sendEmail(
      email,
      '🔗 Lien d\'accès à votre interface syndicale',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Récupération de votre lien d'accès</h1>
          <p>Bonjour,</p>
          <p>Voici votre lien permanent d'accès à votre interface :</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <a href="${data.interface_url}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accéder à votre interface
            </a>
          </div>
          
          <p>Cordialement,<br>L'équipe de la Plateforme Syndicale</p>
        </div>
      `
    );
  } catch (emailError) {
    console.error('Erreur renvoi email:', emailError);
    return new Response(JSON.stringify({ error: 'Erreur lors de l\'envoi de l\'email' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getBureaux(req: Request) {
  // Récupérer les bureaux avec statistiques
  const { data: bureaux, error } = await supabase
    .from('bureaux_syndicaux')
    .select(`
      *,
      travailleurs(count)
    `)
    .order('date_created', { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Enrichir avec données des motos et portefeuilles
  const enrichedBureaux = await Promise.all((bureaux || []).map(async (bureau) => {
    // Compter les motos du bureau
    const { count: motosCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'taxi_moto')
      .ilike('address', `%${bureau.ville}%`);

    // Simuler données de portefeuille (à adapter selon votre structure)
    const balance_gnf = Math.floor(Math.random() * 5000000) + 100000;
    const balance_usd = Math.floor(Math.random() * 2000) + 50;
    const balance_eur = Math.floor(Math.random() * 1800) + 40;
    const total_transactions = Math.floor(Math.random() * 500) + 10;

    return {
      ...bureau,
      motos_count: motosCount || 0,
      balance_gnf,
      balance_usd,
      balance_eur,
      total_transactions
    };
  }));

  const { data, error: returnError } = { data: enrichedBureaux, error: null };

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getTravailleurs(req: Request) {
  const url = new URL(req.url);
  const bureau_id = url.searchParams.get('bureau_id');

  let query = supabase
    .from('travailleurs')
    .select(`
      *,
      bureaux_syndicaux(nom, ville)
    `);

  if (bureau_id) {
    query = query.eq('bureau_id', bureau_id);
  }

  const { data: travailleurs, error } = await query.order('date_created', { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Enrichir avec données de portefeuille et ID utilisateur
  const enrichedTravailleurs = (travailleurs || []).map(travailleur => {
    // Générer un ID utilisateur simulé
    const user_id = `USR-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    // Simuler données de portefeuille
    const wallet_balance = {
      gnf: Math.floor(Math.random() * 2000000) + 50000,
      usd: Math.floor(Math.random() * 800) + 20,
      eur: Math.floor(Math.random() * 700) + 18
    };
    
    const transactions_count = Math.floor(Math.random() * 100) + 5;

    return {
      ...travailleur,
      user_id,
      wallet_balance,
      transactions_count
    };
  });

  const { data, error: returnError } = { data: enrichedTravailleurs, error: null };

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getStatistics(req: Request) {
  try {
    // Récupérer les statistiques
    const [bureaux, travailleurs, motos, alertes] = await Promise.all([
      supabase.from('bureaux_syndicaux').select('id', { count: 'exact' }),
      supabase.from('travailleurs').select('id', { count: 'exact' }),
      supabase.from('motos').select('id', { count: 'exact' }),
      supabase.from('alertes_syndicat').select('*').eq('severity', 'critique').eq('is_read', false)
    ]);

    const stats = {
      total_bureaux: bureaux.count || 0,
      total_travailleurs: travailleurs.count || 0,
      total_motos: motos.count || 0,
      alertes_critiques: alertes.data?.length || 0
    };

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur statistiques:', error);
    return new Response(JSON.stringify({ error: 'Erreur lors de la récupération des statistiques' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function testEmail(req: Request) {
  const { email } = await req.json();
  
  console.log('Test envoi email vers:', email);
  console.log('RESEND_API_KEY configurée:', !!resendApiKey);
  
  if (!resendApiKey) {
    return new Response(JSON.stringify({ 
      error: 'RESEND_API_KEY non configurée dans les secrets Supabase',
      configured: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  try {
    const result = await sendEmail(
      email,
      '🧪 Test d\'envoi d\'email',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Test d'Email Réussi</h1>
          <p>Bonjour,</p>
          <p>Ceci est un email de test pour vérifier que le système d'envoi fonctionne correctement.</p>
          <p>Si vous recevez cet email, la configuration Resend est correcte.</p>
          <p><strong>Heure d'envoi :</strong> ${new Date().toLocaleString('fr-FR')}</p>
          <p>Cordialement,<br>L'équipe de test</p>
        </div>
      `
    );
    
    console.log('Email de test envoyé avec succès:', result);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email de test envoyé avec succès',
      result 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur test email:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur lors du test d\'email',
      details: error.message,
      configured: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

serve(handler);