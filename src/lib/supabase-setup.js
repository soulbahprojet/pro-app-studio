import { supabase } from './supabaseClient.js';

/**
 * Configuration des politiques RLS pour 224Solutions
 * À exécuter une seule fois pour configurer la base de données
 */

export async function setupDatabase() {
    console.log('🔧 Configuration de la base de données...');

    try {
        // 1. Vérifier si la table products existe
        const { data: tables, error: tablesError } = await supabase
            .from('products')
            .select('id')
            .limit(1);

        if (tablesError && tablesError.code === '42P01') {
            console.log('📋 Création de la table products...');

            // Créer la table products si elle n'existe pas
            const { error: createError } = await supabase.rpc('create_products_table');

            if (createError) {
                console.error('❌ Erreur création table:', createError);
                return false;
            }
        }

        // 2. Tester l'insertion avec les politiques actuelles
        console.log('🧪 Test d\'insertion avec RLS...');

        const testProduct = {
            name: 'Produit Test RLS',
            price: 19.99,
            description: 'Test des politiques de sécurité',
            created_by: 'system'
        };

        const { data, error } = await supabase
            .from('products')
            .insert([testProduct])
            .select();

        if (error) {
            console.error('❌ Erreur RLS:', error.message);
            console.log('💡 Solution: Appliquez les politiques du fichier supabase-policies.sql');
            return false;
        }

        console.log('✅ Test RLS réussi:', data);
        return true;

    } catch (error) {
        console.error('❌ Erreur configuration:', error);
        return false;
    }
}

/**
 * Fonction pour créer des produits avec gestion d'erreurs RLS
 */
export async function createProductSafe(productData) {
    try {
        const { data, error } = await supabase
            .from('products')
            .insert([{
                ...productData,
                created_by: 'anonymous', // ou auth.uid() si utilisateur connecté
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            if (error.code === '42501') {
                throw new Error('Politiques RLS: Vous devez être connecté pour créer un produit');
            }
            throw error;
        }

        return data[0];
    } catch (error) {
        console.error('Erreur création produit:', error);
        throw error;
    }
}

/**
 * Fonction pour lire les produits (devrait toujours fonctionner)
 */
export async function getProductsSafe() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erreur lecture produits:', error);
        throw error;
    }
}
