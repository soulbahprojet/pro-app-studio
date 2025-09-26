import { supabase } from './lib/supabaseClient.js';

/**
 * Version simplifiée pour tester sans modification de la structure de table
 */

const productServiceSimple = {
    async getAll() {
        const { data, error } = await supabase
            .from('products')
            .select('*');
        if (error) throw error;
        return data;
    },

    async create(product) {
        // Créer sans les colonnes qui n'existent peut-être pas encore
        const cleanProduct = {
            name: product.name,
            price: product.price,
            description: product.description
        };

        const { data, error } = await supabase
            .from('products')
            .insert([cleanProduct])
            .select();

        if (error) throw error;
        return data[0];
    }
};

async function testSimple() {
    console.log('🚀 Test simple de 224Solutions...\n');

    try {
        // Test de lecture
        console.log('📖 Lecture des produits...');
        const products = await productServiceSimple.getAll();
        console.log(`✅ ${products.length} produits trouvés`);

        // Test de création
        console.log('\n📝 Création d\'un produit test...');
        const newProduct = await productServiceSimple.create({
            name: 'Test 224Solutions',
            price: 99.99,
            description: 'Produit test simple'
        });
        console.log('✅ Produit créé:', newProduct);

        // Relire pour vérifier
        const allProducts = await productServiceSimple.getAll();
        console.log(`\n📦 Total après création: ${allProducts.length} produits`);

        console.log('\n🎉 Test simple réussi !');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        console.log('\n💡 Solutions possibles:');
        console.log('1. Exécutez supabase-complete-setup.sql dans Supabase SQL Editor');
        console.log('2. Ou désactivez temporairement RLS pour les tests');
    }
}

testSimple();
