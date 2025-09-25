/**
 * Service de gestion avancée d'inventaire
 * Réservation de stock, alertes, gestion des conflits
 */

import { supabase } from '@/integrations/supabase/client';

interface StockReservation {
  productId: string;
  quantity: number;
  orderId: string;
  expiresAt: Date;
}

interface StockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  severity: 'low' | 'critical' | 'out_of_stock';
}

interface StockOperation {
  productId: string;
  changeType: 'sale' | 'restock' | 'adjustment' | 'reservation' | 'return';
  quantity: number;
  reason?: string;
  orderId?: string;
}

class InventoryService {
  /**
   * Vérifier la disponibilité d'un produit
   */
  async checkAvailability(productId: string, requestedQuantity: number): Promise<boolean> {
    try {
      const { data: inventory } = await supabase
        .from('inventory')
        .select('quantity_available')
        .eq('product_id', productId)
        .single();

      if (!inventory) return false;
      return inventory.quantity_available >= requestedQuantity;
    } catch (error) {
      console.error('Erreur vérification disponibilité:', error);
      return false;
    }
  }

  /**
   * Réserver du stock pour une commande
   */
  async reserveStock(productId: string, quantity: number, orderId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('reserve_stock', {
        p_product_id: productId,
        p_quantity: quantity,
        p_order_id: orderId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur réservation stock:', error);
      throw new Error('Impossible de réserver le stock');
    }
  }

  /**
   * Confirmer une vente (déplacer de réservé vers vendu)
   */
  async confirmSale(productId: string, quantity: number, orderId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('confirm_sale', {
        p_product_id: productId,
        p_quantity: quantity,
        p_order_id: orderId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur confirmation vente:', error);
      throw new Error('Impossible de confirmer la vente');
    }
  }

  /**
   * Libérer une réservation (annulation commande)
   */
  async releaseReservation(productId: string, quantity: number, orderId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('release_reservation', {
        p_product_id: productId,
        p_quantity: quantity,
        p_order_id: orderId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur libération réservation:', error);
      throw new Error('Impossible de libérer la réservation');
    }
  }

  /**
   * Ajuster manuellement le stock
   */
  async adjustStock(
    vendorId: string,
    productId: string,
    newQuantity: number,
    reason: string
  ): Promise<void> {
    try {
      // Récupérer la quantité actuelle
      const { data: currentInventory } = await supabase
        .from('inventory')
        .select('quantity_available')
        .eq('product_id', productId)
        .eq('vendor_id', vendorId)
        .single();

      if (!currentInventory) {
        throw new Error('Produit non trouvé dans l\'inventaire');
      }

      const previousQty = currentInventory.quantity_available;
      const quantityChange = newQuantity - previousQty;

      // Mettre à jour l'inventaire
      const { error: updateError } = await supabase
        .from('inventory')
        .update({
          quantity_available: newQuantity,
          last_updated: new Date().toISOString()
        })
        .eq('product_id', productId)
        .eq('vendor_id', vendorId);

      if (updateError) throw updateError;

      // Enregistrer dans les logs
      await this.logStockChange({
        productId,
        changeType: 'adjustment',
        quantity: quantityChange,
        reason
      }, vendorId, previousQty, newQuantity);

    } catch (error) {
      console.error('Erreur ajustement stock:', error);
      throw new Error('Impossible d\'ajuster le stock');
    }
  }

  /**
   * Obtenir les alertes de stock faible
   */
  async getStockAlerts(vendorId: string): Promise<StockAlert[]> {
    try {
      const { data } = await supabase
        .from('inventory')
        .select(`
          quantity_available,
          reorder_threshold,
          product_id,
          products!inner(name)
        `)
        .eq('vendor_id', vendorId)
        .filter('quantity_available', 'lte', 'reorder_threshold');

      if (!data) return [];

      return data.map((item: any) => {
        const severity = item.quantity_available === 0 
          ? 'out_of_stock'
          : item.quantity_available <= Math.floor(item.reorder_threshold * 0.5)
          ? 'critical'
          : 'low';

        return {
          productId: item.product_id,
          productName: item.products.name,
          currentStock: item.quantity_available,
          threshold: item.reorder_threshold,
          severity
        };
      });
    } catch (error) {
      console.error('Erreur récupération alertes stock:', error);
      return [];
    }
  }

  /**
   * Obtenir l'historique des mouvements de stock
   */
  async getStockHistory(
    vendorId: string,
    productId?: string,
    limit = 50
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('stock_logs')
        .select(`
          *,
          products!inner(name, seller_id)
        `)
        .eq('products.seller_id', vendorId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erreur historique stock:', error);
      return [];
    }
  }

  /**
   * Enregistrer un mouvement de stock dans les logs
   */
  private async logStockChange(
    operation: StockOperation,
    userId: string,
    previousQty: number,
    newQty: number
  ): Promise<void> {
    try {
      await supabase
        .from('stock_logs')
        .insert({
          product_id: operation.productId,
          change_type: operation.changeType,
          quantity_change: operation.quantity,
          previous_qty: previousQty,
          new_qty: newQty,
          order_id: operation.orderId,
          user_id: userId,
          reason: operation.reason
        });
    } catch (error) {
      console.error('Erreur enregistrement log stock:', error);
      // Ne pas faire échouer l'opération principale
    }
  }

  /**
   * Obtenir les statistiques d'inventaire
   */
  async getInventoryStats(vendorId: string): Promise<{
    totalProducts: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    averageTurnover: number;
  }> {
    try {
      const { data } = await supabase
        .from('inventory')
        .select(`
          quantity_available,
          quantity_sold,
          reorder_threshold,
          products!inner(price, seller_id)
        `)
        .eq('products.seller_id', vendorId);

      if (!data) {
        return {
          totalProducts: 0,
          totalValue: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
          averageTurnover: 0
        };
      }

      const totalProducts = data.length;
      const totalValue = data.reduce((sum, item) => 
        sum + (item.quantity_available * item.products.price), 0
      );
      
      const lowStockCount = data.filter(item => 
        item.quantity_available <= item.reorder_threshold && item.quantity_available > 0
      ).length;
      
      const outOfStockCount = data.filter(item => 
        item.quantity_available === 0
      ).length;

      const averageTurnover = totalProducts > 0 
        ? data.reduce((sum, item) => sum + item.quantity_sold, 0) / totalProducts
        : 0;

      return {
        totalProducts,
        totalValue,
        lowStockCount,
        outOfStockCount,
        averageTurnover: Math.round(averageTurnover * 100) / 100
      };
    } catch (error) {
      console.error('Erreur stats inventaire:', error);
      throw new Error('Impossible de récupérer les statistiques');
    }
  }
}

export const inventoryService = new InventoryService();
export type { StockReservation, StockAlert, StockOperation };