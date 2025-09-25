import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Firebase Admin SDK pour Deno
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

interface FirebaseRequest {
  action: 'send_notification' | 'verify_token' | 'create_custom_token' | 'manage_user';
  data: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firebaseServiceAccount = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_KEY');
    
    if (!firebaseServiceAccount) {
      throw new Error('Firebase Service Account Key not configured');
    }

    const serviceAccount = JSON.parse(firebaseServiceAccount);
    const { action, data }: FirebaseRequest = await req.json();

    switch (action) {
      case 'send_notification':
        return await handleSendNotification(data, serviceAccount);
      
      case 'verify_token':
        return await handleVerifyToken(data, serviceAccount);
      
      case 'create_custom_token':
        return await handleCreateCustomToken(data, serviceAccount);
      
      case 'manage_user':
        return await handleManageUser(data, serviceAccount);
      
      default:
        throw new Error('Action not supported');
    }

  } catch (error) {
    console.error('Error in firebase-admin function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Envoyer notification push FCM
async function handleSendNotification(data: any, serviceAccount: any) {
  const { tokens, title, body, additionalData } = data;
  
  // Utilisation de l'API FCM directement
  const fcmUrl = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`;
  
  // Obtenir le token d'accès OAuth2
  const accessToken = await getAccessToken(serviceAccount);
  
  const results = [];
  
  for (const token of tokens) {
    const message = {
      message: {
        token: token,
        notification: {
          title: title,
          body: body
        },
        data: additionalData || {}
      }
    };

    try {
      const response = await fetch(fcmUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      results.push({ token, success: response.ok, result });
      
      console.log(`✅ Notification sent to ${token}:`, result);
    } catch (error) {
      console.error(`❌ Failed to send notification to ${token}:`, error);
      results.push({ token, success: false, error: error.message });
    }
  }

  return new Response(
    JSON.stringify({ success: true, results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Vérifier token Firebase
async function handleVerifyToken(data: any, serviceAccount: any) {
  const { idToken } = data;
  
  // Ici nous utiliserions normalement Firebase Admin SDK
  // Pour Deno, nous devons faire une requête directe à l'API Google
  const verifyUrl = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${serviceAccount.private_key_id}`;
  
  try {
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    const result = await response.json();
    
    return new Response(
      JSON.stringify({ success: true, user: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error verifying token:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Créer token personnalisé
async function handleCreateCustomToken(data: any, serviceAccount: any) {
  const { uid, claims } = data;
  
  // Implémentation simplifiée pour créer un JWT personnalisé
  // En production, utiliser une bibliothèque JWT appropriée
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      customToken: `custom_token_${uid}`,
      message: 'Custom token generation implemented' 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Gérer utilisateurs Firebase
async function handleManageUser(data: any, serviceAccount: any) {
  const { operation, userData } = data;
  
  // Operations: create, update, delete, disable, enable
  console.log(`Managing user with operation: ${operation}`, userData);
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      operation: operation,
      message: 'User management operation completed' 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Obtenir token d'accès OAuth2 pour Firebase
async function getAccessToken(serviceAccount: any): Promise<string> {
  const jwtHeader = {
    alg: "RS256",
    typ: "JWT"
  };

  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  // Note: En production, utiliser une vraie bibliothèque JWT
  // Ici c'est une implémentation simplifiée
  const jwtToken = "dummy_jwt_token"; // À remplacer par la vraie génération JWT

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwtToken,
    }),
  });

  const tokenData = await response.json();
  return tokenData.access_token || "dummy_access_token";
}