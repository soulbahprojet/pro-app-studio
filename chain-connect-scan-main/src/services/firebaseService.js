/**
 * Service Firebase pour 224SOLUTIONS
 * Gestion de l'auth, messagerie temps réel, stockage et notifications
 */

import { 
  firebaseAuth, 
  firebaseDb, 
  firestore, 
  firebaseStorage, 
  firebaseMessaging 
} from '@/lib/firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut
} from 'firebase/auth';
import { 
  ref, 
  push, 
  onValue, 
  serverTimestamp, 
  set, 
  update 
} from 'firebase/database';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { getToken, onMessage } from 'firebase/messaging';

class FirebaseService {
  constructor() {
    this.auth = firebaseAuth;
    this.realtimeDb = firebaseDb;
    this.firestore = firestore;
    this.storage = firebaseStorage;
    this.messaging = firebaseMessaging;
  }

  // ============= AUTHENTIFICATION =============

  // Connexion par email/mot de passe
  async signInWithEmail(email, password) {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      return { user: result.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  }

  // Inscription par email/mot de passe
  async signUpWithEmail(email, password, userData) {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Enregistrer les données utilisateur supplémentaires dans Firestore
      await addDoc(collection(this.firestore, 'userProfiles'), {
        uid: result.user.uid,
        email: result.user.email,
        ...userData,
        createdAt: serverTimestamp()
      });
      
      return { user: result.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  }

  // Connexion Google
  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      return { user: result.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  }

  // Connexion Facebook
  async signInWithFacebook() {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      return { user: result.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  }

  // Déconnexion
  async signOutUser() {
    try {
      await signOut(this.auth);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }

  // ============= MESSAGERIE TEMPS RÉEL =============

  // Envoyer un message dans une conversation
  async sendMessage(conversationId, message) {
    try {
      const messagesRef = ref(this.realtimeDb, `chats/${conversationId}/messages`);
      await push(messagesRef, {
        ...message,
        timestamp: serverTimestamp(),
        read: false
      });
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Écouter les messages d'une conversation
  subscribeToMessages(conversationId, callback) {
    const messagesRef = ref(this.realtimeDb, `chats/${conversationId}/messages`);
    return onValue(messagesRef, (snapshot) => {
      const messages = [];
      snapshot.forEach((childSnapshot) => {
        messages.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      callback(messages);
    });
  }

  // Marquer les messages comme lus
  async markMessagesAsRead(conversationId, messageIds) {
    try {
      const updates = {};
      messageIds.forEach(messageId => {
        updates[`chats/${conversationId}/messages/${messageId}/read`] = true;
      });
      await update(ref(this.realtimeDb), updates);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }

  // ============= NOTIFICATIONS PUSH =============

  // Envoyer une notification
  async sendNotification(userId, notification) {
    try {
      const notificationsRef = ref(this.realtimeDb, `notifications/${userId}`);
      await push(notificationsRef, {
        ...notification,
        timestamp: serverTimestamp(),
        read: false
      });
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Écouter les notifications d'un utilisateur
  subscribeToNotifications(userId, callback) {
    const notificationsRef = ref(this.realtimeDb, `notifications/${userId}`);
    return onValue(notificationsRef, (snapshot) => {
      const notifications = [];
      snapshot.forEach((childSnapshot) => {
        notifications.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      callback(notifications.reverse()); // Plus récentes en premier
    });
  }

  // Initialiser FCM et récupérer le token
  async initializeFCM() {
    if (!this.messaging) return { token: null, error: 'Messaging not available' };
    
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(this.messaging, {
          vapidKey: 'YOUR_VAPID_KEY' // À configurer
        });
        return { token, error: null };
      }
      return { token: null, error: 'Permission denied' };
    } catch (error) {
      return { token: null, error: error.message };
    }
  }

  // Écouter les messages en avant-plan
  onForegroundMessage(callback) {
    if (!this.messaging) return () => {};
    
    return onMessage(this.messaging, (payload) => {
      callback(payload);
    });
  }

  // ============= STOCKAGE DE FICHIERS =============

  // Uploader une image de profil
  async uploadAvatar(file, userId) {
    try {
      const avatarRef = storageRef(this.storage, `avatars/${userId}/${file.name}`);
      const snapshot = await uploadBytes(avatarRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { url: downloadURL, error: null };
    } catch (error) {
      return { url: null, error: error.message };
    }
  }

  // Uploader une image de chat
  async uploadChatImage(file, conversationId, userId) {
    try {
      const imageRef = storageRef(this.storage, 
        `chat-images/${conversationId}/${userId}/${Date.now()}_${file.name}`
      );
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { url: downloadURL, error: null };
    } catch (error) {
      return { url: null, error: error.message };
    }
  }

  // Uploader une image de produit
  async uploadProductImage(file, productId, sellerId) {
    try {
      const imageRef = storageRef(this.storage, 
        `product-images/${sellerId}/${productId}/${file.name}`
      );
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { url: downloadURL, error: null };
    } catch (error) {
      return { url: null, error: error.message };
    }
  }

  // ============= SUIVI DES COMMANDES TEMPS RÉEL =============

  // Mettre à jour la position d'un livreur
  async updateDeliveryLocation(orderId, location) {
    try {
      const locationRef = ref(this.realtimeDb, `orderTracking/${orderId}/location`);
      await set(locationRef, {
        ...location,
        timestamp: serverTimestamp()
      });
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Écouter les mises à jour de localisation d'une commande
  subscribeToOrderTracking(orderId, callback) {
    const trackingRef = ref(this.realtimeDb, `orderTracking/${orderId}/location`);
    return onValue(trackingRef, (snapshot) => {
      callback(snapshot.val());
    });
  }

  // ============= PRÉSENCE UTILISATEUR =============

  // Définir l'utilisateur en ligne
  async setUserOnline(userId, userInfo) {
    try {
      const presenceRef = ref(this.realtimeDb, `presence/${userId}`);
      await set(presenceRef, {
        ...userInfo,
        status: 'online',
        lastSeen: serverTimestamp()
      });
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Définir l'utilisateur hors ligne
  async setUserOffline(userId) {
    try {
      const presenceRef = ref(this.realtimeDb, `presence/${userId}`);
      await update(presenceRef, {
        status: 'offline',
        lastSeen: serverTimestamp()
      });
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Écouter le statut de présence d'un utilisateur
  subscribeToUserPresence(userId, callback) {
    const presenceRef = ref(this.realtimeDb, `presence/${userId}`);
    return onValue(presenceRef, (snapshot) => {
      callback(snapshot.val());
    });
  }
}

// Export de l'instance du service
export const firebaseService = new FirebaseService();
export default firebaseService;