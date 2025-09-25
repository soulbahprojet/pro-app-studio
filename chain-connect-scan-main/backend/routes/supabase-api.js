// backend/routes/supabase-api.js
// Routes API pour interagir avec Supabase depuis l'AI Copilot

import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Middleware de vérification d'auth spécifique pour ces routes
function verifySupabaseAccess(req, res, next) {
  // Vérifier que l'utilisateur a les droits PDG/Admin
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requis pour accès Supabase' });
  }
  
  // TODO: Valider le token et vérifier le rôle PDG
  req.user = { id: 'pdg-user', role: 'pdg' };
  next();
}

// Initialiser Supabase avec Service Role Key (côté serveur uniquement)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// GET /api/supabase/tables - Lister les tables disponibles
router.get('/tables', verifySupabaseAccess, async (req, res) => {
  try {
    // Liste des principales tables de 224SOLUTIONS
    const tables = [
      'profiles', 'products', 'orders', 'wallets', 'transactions',
      'seller_shops', 'digital_products', 'shipments', 'reviews',
      'admin_roles', 'user_features', 'system_settings'
    ];
    
    res.json({ tables, message: 'Tables disponibles pour l\'AI Copilot' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/supabase/data/:table - Récupérer des données d'une table
router.get('/data/:table', verifySupabaseAccess, async (req, res) => {
  try {
    const { table } = req.params;
    const { limit = 50, offset = 0, filters } = req.query;
    
    // Tables autorisées pour lecture
    const allowedTables = [
      'profiles', 'products', 'orders', 'seller_shops', 
      'digital_products', 'reviews', 'transactions'
    ];
    
    if (!allowedTables.includes(table)) {
      return res.status(403).json({ error: `Table ${table} non autorisée` });
    }
    
    let query = supabase.from(table).select('*').range(offset, offset + limit - 1);
    
    // Appliquer des filtres simples si fournis
    if (filters) {
      try {
        const filterObj = JSON.parse(filters);
        Object.entries(filterObj).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      } catch (e) {
        return res.status(400).json({ error: 'Filtres JSON invalides' });
      }
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    res.json({ 
      data, 
      table, 
      count: data.length,
      message: `Données de ${table} récupérées avec succès` 
    });
    
  } catch (error) {
    console.error(`Erreur lecture table ${req.params.table}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/supabase/query - Exécuter une requête personnalisée (lecture seule)
router.post('/query', verifySupabaseAccess, async (req, res) => {
  try {
    const { table, select = '*', filters = {}, limit = 100 } = req.body;
    
    if (!table) {
      return res.status(400).json({ error: 'Table requise' });
    }
    
    let query = supabase.from(table).select(select).limit(limit);
    
    // Appliquer les filtres
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'object' && value.operator) {
        // Filtres avancés avec opérateurs
        switch (value.operator) {
          case 'gt':
            query = query.gt(key, value.value);
            break;
          case 'lt':
            query = query.lt(key, value.value);
            break;
          case 'like':
            query = query.like(key, `%${value.value}%`);
            break;
          default:
            query = query.eq(key, value.value);
        }
      } else {
        query = query.eq(key, value);
      }
    });
    
    const { data, error } = await query;
    if (error) throw error;
    
    res.json({ 
      data, 
      count: data.length,
      query: { table, select, filters, limit },
      message: 'Requête exécutée avec succès' 
    });
    
  } catch (error) {
    console.error('Erreur requête Supabase:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/supabase/stats - Statistiques globales du projet
router.get('/stats', verifySupabaseAccess, async (req, res) => {
  try {
    const stats = {};
    
    // Statistiques utilisateurs
    const { count: usersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    stats.users = usersCount || 0;
    
    // Statistiques produits
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    stats.products = productsCount || 0;
    
    // Statistiques commandes
    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    stats.orders = ordersCount || 0;
    
    // Statistiques boutiques
    const { count: shopsCount } = await supabase
      .from('seller_shops')
      .select('*', { count: 'exact', head: true });
    stats.shops = shopsCount || 0;
    
    res.json({ 
      stats, 
      timestamp: new Date().toISOString(),
      message: 'Statistiques globales du projet 224SOLUTIONS' 
    });
    
  } catch (error) {
    console.error('Erreur stats Supabase:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/supabase/edge-function - Appeler une Edge Function
router.post('/edge-function/:functionName', verifySupabaseAccess, async (req, res) => {
  try {
    const { functionName } = req.params;
    const { payload = {} } = req.body;
    
    // Fonctions autorisées pour l'AI Copilot
    const allowedFunctions = [
      'stats', 'notifications', 'products', 'orders',
      'wallet', 'digital-store-management'
    ];
    
    if (!allowedFunctions.includes(functionName)) {
      return res.status(403).json({ 
        error: `Fonction ${functionName} non autorisée pour l'AI Copilot` 
      });
    }
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload
    });
    
    if (error) throw error;
    
    res.json({ 
      data, 
      function: functionName,
      message: `Edge Function ${functionName} exécutée avec succès` 
    });
    
  } catch (error) {
    console.error(`Erreur Edge Function ${req.params.functionName}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/supabase/health - Vérifier la connexion Supabase
router.get('/health', verifySupabaseAccess, async (req, res) => {
  try {
    // Test de connexion simple
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    res.json({ 
      status: 'connected',
      supabase_url: process.env.SUPABASE_URL,
      timestamp: new Date().toISOString(),
      message: 'Connexion Supabase OK pour AI Copilot' 
    });
    
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      error: error.message,
      message: 'Problème de connexion Supabase' 
    });
  }
});

export default router;