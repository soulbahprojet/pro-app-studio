/**
 * Exemples d'utilisation du backend hybride 224SOLUTIONS
 * Firebase + Supabase - Cas d'usage concrets
 */

import { hybridBackendService } from '../services/hybridBackendService';
import { firebaseService } from '../services/firebaseService';
import { supabaseService } from '../services/supabaseService';

// ============= EXEMPLES D'AUTHENTIFICATION =============

export const authExamples = {
  // Inscription complète d'un nouvel utilisateur
  async registerNewUser() {
    const userData = {
      email: 'user@224solutions.com',
      password: 'motdepasse123',
      fullName: 'Jean Dupont',
      phone: '+224 123 456 789',
      role: 'client'
    };

    const result = await hybridBackendService.signUpUser(userData);
    
    if (result.error) {
      console.error('Erreur inscription:', result.error);
      return;
    }

    console.log('Utilisateur créé:', result.user);
  },

  // Connexion avec récupération du profil complet
  async loginUser() {
    const result = await hybridBackendService.signInUser(
      'user@224solutions.com', 
      'motdepasse123'
    );

    if (result.error) {
      console.error('Erreur connexion:', result.error);
      return;
    }

    console.log('Utilisateur connecté:', result.user);
    
    // L'utilisateur est maintenant en ligne dans Firebase
    // Son profil complet est disponible depuis Supabase
  },

  // Connexion Google
  async loginWithGoogle() {
    const result = await firebaseService.signInWithGoogle();
    
    if (result.error) {
      console.error('Erreur Google Auth:', result.error);
      return;
    }

    console.log('Connecté via Google:', result.user);
  }
};

// ============= EXEMPLES DE GESTION DES PRODUITS =============

export const productExamples = {
  // Créer un produit avec images
  async createProductWithImages() {
    const productData = {
      name: 'Smartphone Samsung Galaxy',
      description: 'Dernière génération, 128GB',
      price: 850000, // Prix en GNF
      category_id: 'uuid-category-electronics',
      seller_id: 'uuid-seller-123',
      stock_quantity: 10,
      currency: 'GNF'
    };

    // Simuler des fichiers images
    const images = [
      // Ces seraient des objets File en réalité
      { name: 'phone-front.jpg', data: 'blob-data' },
      { name: 'phone-back.jpg', data: 'blob-data' }
    ];

    const result = await hybridBackendService.createProduct(productData, images);
    
    if (result.error) {
      console.error('Erreur création produit:', result.error);
      return;
    }

    console.log('Produit créé avec images:', result.product);
  },

  // Rechercher des produits
  async searchProducts() {
    const result = await supabaseService.searchProducts('Samsung', {
      categoryId: 'uuid-category-electronics',
      minPrice: 500000,
      maxPrice: 1000000
    });

    if (result.error) {
      console.error('Erreur recherche:', result.error);
      return;
    }

    console.log('Produits trouvés:', result.data);
  },

  // Récupérer les produits d'une catégorie
  async getProductsByCategory() {
    const result = await supabaseService.getProducts(1, 20, 'uuid-category-electronics');
    
    if (result.error) {
      console.error('Erreur récupération produits:', result.error);
      return;
    }

    console.log('Produits de la catégorie:', result.data);
  }
};

// ============= EXEMPLES DE GESTION DES COMMANDES =============

export const orderExamples = {
  // Créer une nouvelle commande
  async createNewOrder() {
    const orderData = {
      customer_id: 'uuid-customer-123',
      seller_id: 'uuid-seller-456',
      total_amount: 950000,
      currency: 'GNF',
      status: 'pending',
      payment_status: 'pending',
      shipping_address: {
        street: 'Rue Kassa Keita',
        city: 'Conakry',
        country: 'Guinée'
      },
      items: [
        {
          product_id: 'uuid-product-789',
          quantity: 1,
          price: 850000
        }
      ]
    };

    const result = await hybridBackendService.createOrder(orderData);
    
    if (result.error) {
      console.error('Erreur création commande:', result.error);
      return;
    }

    console.log('Commande créée:', result.order);
    // Une notification a été automatiquement envoyée au vendeur
  },

  // Mettre à jour le statut avec localisation
  async updateOrderWithTracking() {
    const orderId = 'uuid-order-123';
    const location = {
      latitude: 9.641185,
      longitude: -13.578401,
      address: 'Marché Madina, Conakry'
    };

    const result = await hybridBackendService.updateOrderStatus(
      orderId, 
      'in_transit', 
      location
    );

    if (result.error) {
      console.error('Erreur mise à jour commande:', result.error);
      return;
    }

    console.log('Commande mise à jour avec suivi GPS');
    // Le client recevra une notification automatiquement
  },

  // Traiter un paiement
  async processOrderPayment() {
    const paymentData = {
      senderId: 'uuid-customer-123',
      recipientId: 'uuid-seller-456',
      amount: 950000,
      currency: 'GNF',
      fee: 47500, // 5% de commission
      reference: 'ORDER-2024-001',
      description: 'Paiement commande Samsung Galaxy'
    };

    const result = await supabaseService.processPayment(paymentData);
    
    if (result.error) {
      console.error('Erreur paiement:', result.error);
      return;
    }

    console.log('Paiement traité avec succès');
  }
};

// ============= EXEMPLES DE MESSAGERIE =============

export const messagingExamples = {
  // Créer une conversation et envoyer un message
  async startConversation() {
    const customerId = 'uuid-customer-123';
    const sellerId = 'uuid-seller-456';
    const orderId = 'uuid-order-789';

    // 1. Créer la conversation
    const convResult = await hybridBackendService.createConversation(
      customerId, 
      sellerId, 
      orderId
    );

    if (convResult.error) {
      console.error('Erreur création conversation:', convResult.error);
      return;
    }

    const conversationId = convResult.conversationId;

    // 2. Envoyer un message
    await hybridBackendService.sendMessage(
      conversationId,
      customerId,
      'Bonjour, quand sera livrée ma commande ?'
    );

    console.log('Conversation créée et premier message envoyé');
  },

  // Envoyer un message avec image
  async sendMessageWithImage() {
    const conversationId = 'uuid-conversation-123';
    const senderId = 'uuid-user-456';
    const message = 'Voici une photo du produit';
    
    // Simuler un fichier image
    const imageFile = { name: 'product-photo.jpg', data: 'blob-data' };

    const result = await hybridBackendService.sendMessage(
      conversationId,
      senderId,
      message,
      imageFile
    );

    if (result.error) {
      console.error('Erreur envoi message:', result.error);
      return;
    }

    console.log('Message avec image envoyé');
  },

  // Écouter les messages en temps réel
  async listenToMessages() {
    const conversationId = 'uuid-conversation-123';

    const unsubscribe = firebaseService.subscribeToMessages(
      conversationId,
      (messages) => {
        console.log('Nouveaux messages:', messages);
        
        // Mettre à jour l'interface utilisateur
        // Marquer les messages comme lus si nécessaire
      }
    );

    // Pour arrêter l'écoute plus tard
    // unsubscribe();
  }
};

// ============= EXEMPLES DE NOTIFICATIONS =============

export const notificationExamples = {
  // Envoyer une notification personnalisée
  async sendCustomNotification() {
    const userId = 'uuid-user-123';
    const notification = {
      type: 'promotion',
      title: '🎉 Promotion spéciale !',
      message: 'Réduction de 20% sur tous les smartphones',
      data: {
        category: 'electronics',
        discount: '20%'
      }
    };

    const result = await firebaseService.sendNotification(userId, notification);
    
    if (result.error) {
      console.error('Erreur notification:', result.error);
      return;
    }

    console.log('Notification envoyée');
  },

  // Écouter les notifications
  async listenToNotifications() {
    const userId = 'uuid-user-123';

    const unsubscribe = firebaseService.subscribeToNotifications(
      userId,
      (notifications) => {
        console.log('Nouvelles notifications:', notifications);
        
        // Mettre à jour le badge de notifications non lues
        const unreadCount = notifications.filter(n => !n.read).length;
        console.log('Notifications non lues:', unreadCount);
      }
    );

    // Pour arrêter l'écoute plus tard
    // unsubscribe();
  }
};

// ============= EXEMPLES D'ANALYTICS =============

export const analyticsExamples = {
  // Tableau de bord vendeur complet
  async getSellerDashboard() {
    const sellerId = 'uuid-seller-123';

    const result = await hybridBackendService.getSellerDashboard(sellerId);
    
    if (result.error) {
      console.error('Erreur tableau de bord:', result.error);
      return;
    }

    console.log('Tableau de bord:', result.data);
    /*
    Résultat attendu:
    {
      sales: {
        totalSales: 2500000,
        orderCount: 15,
        averageOrderValue: 166666
      },
      topProducts: [
        { product_id: 'uuid', name: 'Samsung Galaxy', quantity: 8 },
        { product_id: 'uuid', name: 'iPhone 13', quantity: 5 }
      ]
    }
    */
  },

  // Statistiques de vente détaillées
  async getSalesAnalytics() {
    const sellerId = 'uuid-seller-123';

    // Ventes des 30 derniers jours
    const monthlyStats = await supabaseService.getSalesStats(sellerId, '30d');
    
    // Ventes de la semaine
    const weeklyStats = await supabaseService.getSalesStats(sellerId, '7d');

    console.log('Ventes mensuelles:', monthlyStats.data);
    console.log('Ventes hebdomadaires:', weeklyStats.data);
  }
};

// ============= EXEMPLE D'UTILISATION COMPLÈTE =============

export const completeWorkflowExample = {
  // Scénario complet : De l'inscription à la commande
  async fullUserJourney() {
    console.log('=== Début du parcours utilisateur complet ===');

    try {
      // 1. Inscription du client
      console.log('1. Inscription du client...');
      const signupResult = await hybridBackendService.signUpUser({
        email: 'client@test.com',
        password: 'password123',
        fullName: 'Test Client',
        phone: '+224 123 456 789',
        role: 'client'
      });

      if (signupResult.error) throw new Error(signupResult.error);

      // 2. Connexion du client
      console.log('2. Connexion du client...');
      const loginResult = await hybridBackendService.signInUser(
        'client@test.com', 
        'password123'
      );

      if (loginResult.error) throw new Error(loginResult.error);

      const clientId = loginResult.user.profile.user_id;

      // 3. Recherche de produits
      console.log('3. Recherche de produits...');
      const productsResult = await supabaseService.searchProducts('phone');
      
      if (productsResult.error) throw new Error(productsResult.error);

      const selectedProduct = productsResult.data[0];

      // 4. Création de la commande
      console.log('4. Création de la commande...');
      const orderResult = await hybridBackendService.createOrder({
        customer_id: clientId,
        seller_id: selectedProduct.seller_id,
        total_amount: selectedProduct.price,
        currency: 'GNF',
        status: 'pending',
        items: [
          {
            product_id: selectedProduct.id,
            quantity: 1,
            price: selectedProduct.price
          }
        ]
      });

      if (orderResult.error) throw new Error(orderResult.error);

      const orderId = orderResult.order.id;

      // 5. Démarrage d'une conversation
      console.log('5. Démarrage de la conversation...');
      const convResult = await hybridBackendService.createConversation(
        clientId,
        selectedProduct.seller_id,
        orderId
      );

      if (convResult.error) throw new Error(convResult.error);

      // 6. Envoi d'un message
      console.log('6. Envoi d\'un message...');
      await hybridBackendService.sendMessage(
        convResult.conversationId,
        clientId,
        'Bonjour, j\'ai passé une commande. Quand sera-t-elle livrée ?'
      );

      // 7. Mise à jour du statut de la commande
      console.log('7. Mise à jour du statut...');
      await hybridBackendService.updateOrderStatus(
        orderId,
        'confirmed',
        {
          latitude: 9.641185,
          longitude: -13.578401,
          address: 'Entrepôt Conakry'
        }
      );

      console.log('=== Parcours utilisateur terminé avec succès ! ===');

    } catch (error) {
      console.error('Erreur dans le parcours utilisateur:', error.message);
    }
  }
};

// Export global pour tests
export default {
  auth: authExamples,
  products: productExamples,
  orders: orderExamples,
  messaging: messagingExamples,
  notifications: notificationExamples,
  analytics: analyticsExamples,
  completeWorkflow: completeWorkflowExample
};