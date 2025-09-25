/**
 * Configuration Firebase pour 224SOLUTIONS
 * Services : Auth, Realtime Database, Storage, Cloud Messaging
 */

export const firebaseConfig = {
  // Configuration principale
  apiKey: "AIzaSyBVqFfOJJbRPG1ZvjiFOpYZ01hfpqr6FVI",
  authDomain: "solutions-ai-app-a8d57.firebaseapp.com",
  databaseURL: "https://solutions-ai-app-a8d57-default-rtdb.firebaseio.com",
  projectId: "solutions-ai-app-a8d57",
  storageBucket: "solutions-ai-app-a8d57.appspot.com",
  messagingSenderId: "561608626006",
  appId: "1:561608626006:web:224solutions",
  measurementId: "G-MEASUREMENT_ID"
};

// Configuration des services Firebase
export const firebaseServices = {
  // Auth - Méthodes d'authentification
  auth: {
    providers: ['email', 'phone', 'google', 'facebook'],
    settings: {
      enableEmailVerification: true,
      enablePhoneVerification: true,
      sessionTimeout: 3600 * 24 * 7 // 7 jours
    }
  },
  
  // Realtime Database - Messagerie instantanée
  realtimeDb: {
    endpoints: {
      chat: '/chats',
      notifications: '/notifications',
      presence: '/presence',
      orderTracking: '/orderTracking'
    },
    rules: {
      secured: true,
      userBasedAccess: true
    }
  },
  
  // Storage - Images et vidéos
  storage: {
    buckets: {
      avatars: 'avatars/',
      chatImages: 'chat-images/',
      productImages: 'product-images/',
      documents: 'documents/'
    },
    limits: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/*', 'video/*', 'application/pdf']
    }
  },
  
  // Cloud Messaging - Notifications push
  messaging: {
    vapidKey: 'YOUR_VAPID_KEY', // À configurer dans Firebase Console
    topics: {
      allUsers: 'all-users',
      orders: 'order-updates',
      messages: 'new-messages'
    }
  }
};

// Export de la configuration pour utilisation dans l'app
export default {
  config: firebaseConfig,
  services: firebaseServices
};