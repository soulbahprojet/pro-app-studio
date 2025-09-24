import { supabase } from './src/lib/supabaseClient.js';

async function testConnection() {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    console.log('Connexion réussie ✅ Données :', data);
  } catch (err) {
    console.error('Erreur connexion Supabase:', err.message);
  }
}

testConnection();

