/**
 * Configuration Supabase pour 224SOLUTIONS
 * Services : Base SQL PostgreSQL, API REST, Stockage (optionnel)
 */

export const supabaseConfig = {
  // Configuration principale
  url: "https://vuqauasbhkfozehfmkjt.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1cWF1YXNiaGtmb3plaGZta2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NjIyMDgsImV4cCI6MjA3MTEzODIwOH0.Eyzp2qTGUAGN74hbb35FoohcIRdqWIJ1O4oc9hjZyLU",
  
  // Configuration des services
  services: {
    // Base SQL PostgreSQL
    database: {
      tables: {
        // Gestion des produits et catégories
        categories: 'categories',
        products: 'products',
        inventory: 'inventory',
        
        // Gestion des commandes et transactions
        orders: 'orders',
        orderItems: 'order_items',
        transactions: 'transactions',
        wallets: 'wallets',
        
        // Gestion des utilisateurs et profils
        profiles: 'profiles',
        shops: 'seller_shops',
        reviews: 'reviews',
        
        // Analytics et statistiques
        analytics: 'analytics_data',
        salesStats: 'sales_statistics',
        userActivity: 'user_activity'
      },
      
      // Fonctions sécurisées
      functions: {
        processPayment: 'process_payment',
        updateInventory: 'update_inventory',
        calculateShipping: 'calculate_shipping',
        generateInvoice: 'generate_invoice'
      }
    },
    
    // API REST/GraphQL
    api: {
      endpoints: {
        products: '/rest/v1/products',
        orders: '/rest/v1/orders',
        transactions: '/rest/v1/transactions',
        analytics: '/rest/v1/analytics_data'
      },
      
      // Configuration RLS (Row Level Security)
      security: {
        enableRLS: true,
        userBasedAccess: true,
        roleBasedAccess: true
      }
    },
    
    // Stockage Supabase (optionnel - complément à Firebase Storage)
    storage: {
      buckets: {
        documents: 'documents',
        backups: 'data-backups',
        exports: 'data-exports'
      }
    }
  }
};

// Types de données Supabase
export const supabaseTypes = {
  // Produits et catégories
  Product: {
    id: 'uuid',
    name: 'string',
    description: 'text',
    price: 'decimal',
    category_id: 'uuid',
    seller_id: 'uuid',
    stock_quantity: 'integer',
    images: 'array',
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },
  
  Category: {
    id: 'uuid',
    name: 'string',
    description: 'text',
    parent_id: 'uuid',
    image_url: 'string',
    is_active: 'boolean'
  },
  
  // Commandes et transactions
  Order: {
    id: 'uuid',
    customer_id: 'uuid',
    seller_id: 'uuid',
    total_amount: 'decimal',
    status: 'enum',
    payment_status: 'enum',
    shipping_address: 'jsonb',
    created_at: 'timestamp'
  },
  
  Transaction: {
    id: 'uuid',
    order_id: 'uuid',
    amount: 'decimal',
    currency: 'string',
    payment_method: 'string',
    status: 'enum',
    created_at: 'timestamp'
  }
};

// Export de la configuration pour utilisation dans l'app
export default {
  config: supabaseConfig,
  types: supabaseTypes
};