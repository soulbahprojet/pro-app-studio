import { supabase } from './integrations/supabase/client';
import { setupDatabase, createProductSafe, getProductsSafe } from './lib/supabase-setup.js';

/**
 * Application 224Solutions avec gestion RLS
 */

// Service produits avec gestion des politiques RLS
export const productServiceRLS = {
    // Lire tous les produits (toujours autorisé)
    async getAll() {
        try {
            return await getProductsSafe();
        } catch (error) {
            console.error('❌ Erreur lecture:', error.message);
            return [];
        }
    },

    // Créer un produit avec gestion RLS
    async create(product) {
        try {
            return await createProductSafe(product);
        } catch (error) {
            console.error('❌ Erreur création:', error.message);
            throw error;
        }
    },

    // Test de connexion simple
    async testConnection() {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('count')
                .limit(1);

            if (error) throw error;
            console.log('✅ Connexion Supabase réussie');
            return true;
        } catch (error) {
            console.error('❌ Erreur connexion:', error.message);
            return false;
        }
    }
};

// Fonction principale de test
async function testAppWithRLS() {
    console.log('🚀 Test 224Solutions avec RLS activé...\n');

    // 1. Test de connexion
    console.log('1️⃣ Test de connexion...');
    const connected = await productServiceRLS.testConnection();
    if (!connected) return;

    // 2. Test de lecture (devrait toujours fonctionner)
    console.log('\n2️⃣ Test de lecture des produits...');
    const products = await productServiceRLS.getAll();
    console.log(`📦 ${products.length} produits trouvés:`, products);

    // 3. Test de création (peut échouer si RLS mal configuré)
    console.log('\n3️⃣ Test de création de produit...');
    try {
        const newProduct = await productServiceRLS.create({
            name: 'Produit Test 224Solutions',
            price: 29.99,
            description: 'Test avec politiques RLS activées'
        });
        console.log('✅ Produit créé avec succès:', newProduct);
    } catch (error) {
        console.log('⚠️ Création échouée (normal si RLS non configuré)');
        console.log('📋 Appliquez les politiques du fichier supabase-policies.sql');
    }

    // 4. Configuration automatique si possible
    console.log('\n4️⃣ Test de configuration...');
    const configured = await setupDatabase();
    if (configured) {
        console.log('✅ Base de données configurée');
    }

    console.log('\n🎉 Test terminé !');
    console.log('\n📝 Prochaines étapes:');
    console.log('1. Connectez-vous à votre dashboard Supabase');
    console.log('2. Allez dans SQL Editor');
    console.log('3. Exécutez le contenu du fichier supabase-policies.sql');
    console.log('4. Relancez ce test avec: npm run test:rls');
}

// Exécuter le test
testAppWithRLS();
