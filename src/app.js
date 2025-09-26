import { supabase } from './integrations/supabase/client.js';

// Fonctions CRUD pour products
export const productService = {
    // Créer un produit
    async create(product) {
        const { data, error } = await supabase
            .from('products')
            .insert([product])
            .select();
        if (error) throw error;
        return data[0];
    },

    // Lire tous les produits
    async getAll() {
        const { data, error } = await supabase
            .from('products')
            .select('*');
        if (error) throw error;
        return data;
    },

    // Mettre à jour un produit
    async update(id, updates) {
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select();
        if (error) throw error;
        return data[0];
    },

    // Supprimer un produit
    async delete(id) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    }
};

// Test des fonctionnalités
async function testApp() {
    try {
        console.log('🚀 Test des fonctionnalités...');

        // Créer un produit test
        const newProduct = await productService.create({
            name: 'Produit Test',
            price: 29.99,
            description: 'Description du produit test'
        });
        console.log('✅ Produit créé:', newProduct);

        // Lire tous les produits
        const products = await productService.getAll();
        console.log('✅ Produits récupérés:', products);

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

testApp();


