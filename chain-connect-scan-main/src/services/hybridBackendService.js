/**
 * Service hybride Firebase + Supabase pour 224SOLUTIONS
 * Orchestration intelligente des deux backends
 */

import { firebaseService } from './firebaseService';
import { supabaseService } from './supabaseService';

class HybridBackendService {
  constructor() {
    this.firebase = firebaseService;
    this.supabase = supabaseService;
  }

  // ============= AUTHENTIFICATION HYBRIDE =============

  // Connexion utilisateur (Firebase Auth + Supabase Profile)
  async signInUser(email, password) {
    try {
      // 1. Authentification via Firebase
      const firebaseResult = await this.firebase.signInWithEmail(email, password);
      
      if (firebaseResult.error) {
        return { user: null, error: firebaseResult.error };
      }

      // 2. Récupérer le profil complet depuis Supabase
      const { data: profile } = await this.supabase.client
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      // 3. Définir l'utilisateur en ligne dans Firebase
      if (profile) {
        await this.firebase.setUserOnline(profile.user_id, {
          name: profile.full_name,
          role: profile.role
        });
      }

      return { 
        user: {
          firebase: firebaseResult.user,
          profile: profile
        }, 
        error: null 
      };
    } catch (error) {
      return { user: null, error: error.message };
    }
  }

  // Inscription utilisateur (Firebase Auth + Supabase Profile)
  async signUpUser(userData) {
    try {
      // 1. Créer l'utilisateur dans Firebase
      const firebaseResult = await this.firebase.signUpWithEmail(
        userData.email, 
        userData.password,
        { name: userData.fullName }
      );

      if (firebaseResult.error) {
        return { user: null, error: firebaseResult.error };
      }

      // 2. Créer le profil dans Supabase (via trigger automatique)
      // Le trigger handle_new_user_signup() s'occupe de créer le profil

      return { 
        user: firebaseResult.user, 
        error: null 
      };
    } catch (error) {
      return { user: null, error: error.message };
    }
  }

  // ============= GESTION DES PRODUITS =============

  // Créer un produit (Supabase) + Images (Firebase)
  async createProduct(productData, images = []) {
    try {
      // 1. Créer le produit dans Supabase
      const productResult = await this.supabase.createProduct(productData);
      
      if (productResult.error) {
        return { product: null, error: productResult.error };
      }

      const product = productResult.data[0];

      // 2. Uploader les images dans Firebase Storage
      const imageUrls = [];
      for (const image of images) {
        const imageResult = await this.firebase.uploadProductImage(
          image, 
          product.id, 
          product.seller_id
        );
        
        if (imageResult.url) {
          imageUrls.push(imageResult.url);
        }
      }

      // 3. Mettre à jour le produit avec les URLs des images
      if (imageUrls.length > 0) {
        await this.supabase.updateProduct(product.id, { images: imageUrls });
      }

      return { 
        product: { ...product, images: imageUrls }, 
        error: null 
      };
    } catch (error) {
      return { product: null, error: error.message };
    }
  }

  // ============= GESTION DES COMMANDES =============

  // Créer une commande avec suivi temps réel
  async createOrder(orderData) {
    try {
      // 1. Créer la commande dans Supabase
      const orderResult = await this.supabase.createOrder(orderData);
      
      if (orderResult.error) {
        return { order: null, error: orderResult.error };
      }

      const order = orderResult.data[0];

      // 2. Initialiser le suivi temps réel dans Firebase
      await this.firebase.updateDeliveryLocation(order.id, {
        status: 'pending',
        location: null,
        estimated_delivery: null
      });

      // 3. Envoyer une notification au vendeur
      await this.firebase.sendNotification(order.seller_id, {
        type: 'new_order',
        title: 'Nouvelle commande',
        message: `Commande #${order.readable_id} reçue`,
        orderId: order.id,
        data: { orderId: order.id }
      });

      return { order, error: null };
    } catch (error) {
      return { order: null, error: error.message };
    }
  }

  // Mettre à jour le statut d'une commande
  async updateOrderStatus(orderId, status, location = null) {
    try {
      // 1. Mettre à jour le statut dans Supabase
      const updateResult = await this.supabase.updateOrderStatus(orderId, status);
      
      if (updateResult.error) {
        return { error: updateResult.error };
      }

      // 2. Mettre à jour le suivi temps réel dans Firebase
      if (location) {
        await this.firebase.updateDeliveryLocation(orderId, {
          status,
          location,
          timestamp: Date.now()
        });
      }

      // 3. Notifier le client
      const order = updateResult.data[0];
      await this.firebase.sendNotification(order.customer_id, {
        type: 'order_update',
        title: 'Mise à jour de commande',
        message: `Votre commande est maintenant ${status}`,
        orderId: orderId,
        data: { orderId: orderId, status: status }
      });

      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }

  // ============= MESSAGERIE =============

  // Créer une conversation entre client et vendeur
  async createConversation(customerId, sellerId, orderId = null) {
    try {
      // 1. Créer la conversation dans Firestore (Firebase)
      const conversationData = {
        participants: [customerId, sellerId],
        orderId: orderId,
        createdAt: new Date(),
        lastMessage: null,
        unreadCount: { [customerId]: 0, [sellerId]: 0 }
      };

      const conversationResult = await this.firebase.firestore
        .collection('conversations')
        .add(conversationData);

      // 2. Initialiser le chat temps réel dans Realtime Database
      const conversationId = conversationResult.id;
      
      return { conversationId, error: null };
    } catch (error) {
      return { conversationId: null, error: error.message };
    }
  }

  // Envoyer un message avec image optionnelle
  async sendMessage(conversationId, senderId, message, imageFile = null) {
    try {
      let imageUrl = null;

      // 1. Uploader l'image si présente
      if (imageFile) {
        const imageResult = await this.firebase.uploadChatImage(
          imageFile, 
          conversationId, 
          senderId
        );
        
        if (imageResult.url) {
          imageUrl = imageResult.url;
        }
      }

      // 2. Envoyer le message dans Firebase Realtime Database
      const messageData = {
        senderId,
        message,
        imageUrl,
        type: imageUrl ? 'image' : 'text',
        timestamp: Date.now()
      };

      await this.firebase.sendMessage(conversationId, messageData);

      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }

  // ============= ANALYTICS HYBRIDES =============

  // Récupérer le tableau de bord complet d'un vendeur
  async getSellerDashboard(sellerId) {
    try {
      // 1. Statistiques de vente depuis Supabase
      const salesStats = await this.supabase.getSalesStats(sellerId);
      
      // 2. Produits populaires depuis Supabase
      const topProducts = await this.supabase.getTopProducts(sellerId);
      
      // 3. Messages non lus depuis Firebase
      // Cette partie nécessiterait une fonction pour compter les messages non lus
      
      return {
        data: {
          sales: salesStats.data,
          topProducts: topProducts.data,
          // messages: unreadMessages.data
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // ============= SYNCHRONISATION =============

  // Synchroniser les données entre Firebase et Supabase
  async syncUserData(userId) {
    try {
      // Récupérer les données depuis Supabase
      const { data: profile } = await this.supabase.client
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profile) {
        // Mettre à jour le statut dans Firebase
        await this.firebase.setUserOnline(userId, {
          name: profile.full_name,
          role: profile.role,
          avatar: profile.avatar_url
        });
      }

      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }

  // ============= CONFIGURATION =============

  // Initialiser les services
  async initialize() {
    try {
      // Initialiser Firebase Cloud Messaging
      const fcmResult = await this.firebase.initializeFCM();
      
      // Enregistrer le service worker pour les notifications
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      }

      return { 
        fcmToken: fcmResult.token, 
        error: fcmResult.error 
      };
    } catch (error) {
      return { fcmToken: null, error: error.message };
    }
  }
}

// Export de l'instance du service hybride
export const hybridBackendService = new HybridBackendService();
export default hybridBackendService;