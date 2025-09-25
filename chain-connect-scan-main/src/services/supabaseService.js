/**
 * Service Supabase pour 224SOLUTIONS
 * Gestion des données SQL, transactions et analytics
 */

import { supabase } from '@/integrations/supabase/client';

class SupabaseService {
  constructor() {
    this.client = supabase;
  }

  // ============= PRODUITS ET CATÉGORIES =============
  
  // Récupérer tous les produits avec pagination
  async getProducts(page = 1, limit = 20, categoryId = null) {
    try {
      let query = this.client
        .from('products')
        .select(`
          *,
          categories(name, description),
          profiles(full_name, shop_name)
        `)
        .eq('is_active', true)
        .range((page - 1) * limit, page * limit - 1);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Créer un nouveau produit
  async createProduct(productData) {
    try {
      const { data, error } = await this.client
        .from('products')
        .insert([productData])
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Mettre à jour un produit
  async updateProduct(productId, updates) {
    try {
      const { data, error } = await this.client
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Récupérer les catégories
  async getCategories() {
    try {
      const { data, error } = await this.client
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // ============= COMMANDES ET TRANSACTIONS =============

  // Créer une nouvelle commande
  async createOrder(orderData) {
    try {
      const { data, error } = await this.client
        .from('orders')
        .insert([orderData])
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Récupérer les commandes d'un utilisateur
  async getUserOrders(userId, status = null) {
    try {
      let query = this.client
        .from('orders')
        .select(`
          *,
          order_items(*),
          profiles!seller_id(full_name, phone)
        `)
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Mettre à jour le statut d'une commande
  async updateOrderStatus(orderId, status) {
    try {
      const { data, error } = await this.client
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Traiter un paiement (fonction sécurisée)
  async processPayment(paymentData) {
    try {
      const { data, error } = await this.client.rpc('process_wallet_transfer', {
        p_sender_id: paymentData.senderId,
        p_recipient_id: paymentData.recipientId,
        p_amount: paymentData.amount,
        p_currency: paymentData.currency,
        p_fee: paymentData.fee,
        p_reference: paymentData.reference,
        p_description: paymentData.description
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // ============= GESTION DES STOCKS =============

  // Vérifier le stock d'un produit
  async checkProductStock(productId) {
    try {
      const { data, error } = await this.client
        .from('inventory')
        .select('quantity_available, quantity_reserved')
        .eq('product_id', productId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Réserver du stock
  async reserveStock(productId, quantity, orderId) {
    try {
      const { data, error } = await this.client.rpc('reserve_stock', {
        p_product_id: productId,
        p_quantity: quantity,
        p_order_id: orderId
      });

      if (error) throw error;
      return { data: success: data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // ============= ANALYTICS ET STATISTIQUES =============

  // Récupérer les statistiques de vente
  async getSalesStats(sellerId, period = '30d') {
    try {
      const { data, error } = await this.client
        .from('orders')
        .select('total_amount, status, created_at')
        .eq('seller_id', sellerId)
        .gte('created_at', this.getDateRange(period))
        .eq('status', 'completed');

      if (error) throw error;
      
      // Calculer les statistiques
      const stats = {
        totalSales: data.reduce((sum, order) => sum + order.total_amount, 0),
        orderCount: data.length,
        averageOrderValue: data.length > 0 ? data.reduce((sum, order) => sum + order.total_amount, 0) / data.length : 0
      };
      
      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Récupérer les produits les plus vendus
  async getTopProducts(sellerId, limit = 10) {
    try {
      const { data, error } = await this.client
        .from('order_items')
        .select(`
          product_id,
          products(name, price, images),
          quantity
        `)
        .eq('products.seller_id', sellerId)
        .order('quantity', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // ============= MÉTHODES UTILITAIRES =============

  // Calculer la plage de dates
  getDateRange(period) {
    const now = new Date();
    const days = parseInt(period.replace('d', ''));
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    return startDate.toISOString();
  }

  // Recherche de produits
  async searchProducts(query, filters = {}) {
    try {
      let supabaseQuery = this.client
        .from('products')
        .select(`
          *,
          categories(name),
          profiles(full_name)
        `)
        .eq('is_active', true)
        .ilike('name', `%${query}%`);

      // Appliquer les filtres
      if (filters.categoryId) {
        supabaseQuery = supabaseQuery.eq('category_id', filters.categoryId);
      }
      if (filters.minPrice) {
        supabaseQuery = supabaseQuery.gte('price', filters.minPrice);
      }
      if (filters.maxPrice) {
        supabaseQuery = supabaseQuery.lte('price', filters.maxPrice);
      }

      const { data, error } = await supabaseQuery;
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }
}

// Export de l'instance du service
export const supabaseService = new SupabaseService();
export default supabaseService;