import { 
  ref, 
  push, 
  set, 
  onValue, 
  off, 
  update, 
  remove,
  serverTimestamp,
  query,
  orderByChild,
  limitToLast,
  equalTo
} from 'firebase/database';
import { firebaseDb } from '@/lib/firebase';

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: any;
  orderId?: string;
  messageType: 'text' | 'location' | 'image';
  read: boolean;
}

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'delivery' | 'system';
  read: boolean;
  timestamp: any;
  data?: any;
}

export class FirebaseRealtimeService {
  // Chat Messages
  async sendMessage(orderId: string, message: ChatMessage) {
    try {
      const messagesRef = ref(firebaseDb, `chats/${orderId}/messages`);
      const messageData = {
        ...message,
        timestamp: serverTimestamp()
      };
      const result = await push(messagesRef, messageData);
      return { messageId: result.key, error: null };
    } catch (error: any) {
      return { messageId: null, error: error.message };
    }
  }

  // Listen to messages for an order
  subscribeToMessages(orderId: string, callback: (messages: ChatMessage[]) => void) {
    const messagesRef = ref(firebaseDb, `chats/${orderId}/messages`);
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));
    
    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((childSnapshot) => {
        messages.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      callback(messages);
    });

    return () => off(messagesRef, 'value', unsubscribe);
  }

  // Mark messages as read
  async markMessagesAsRead(orderId: string, messageIds: string[]) {
    try {
      const updates: { [key: string]: any } = {};
      messageIds.forEach(messageId => {
        updates[`chats/${orderId}/messages/${messageId}/read`] = true;
      });
      await update(ref(firebaseDb), updates);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Notifications
  async sendNotification(notification: Notification) {
    try {
      const notificationsRef = ref(firebaseDb, `notifications/${notification.userId}`);
      const notificationData = {
        ...notification,
        timestamp: serverTimestamp()
      };
      const result = await push(notificationsRef, notificationData);
      return { notificationId: result.key, error: null };
    } catch (error: any) {
      return { notificationId: null, error: error.message };
    }
  }

  // Listen to user notifications
  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const notificationsRef = ref(firebaseDb, `notifications/${userId}`);
    const notificationsQuery = query(notificationsRef, orderByChild('timestamp'), limitToLast(50));
    
    const unsubscribe = onValue(notificationsQuery, (snapshot) => {
      const notifications: Notification[] = [];
      snapshot.forEach((childSnapshot) => {
        notifications.unshift({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      callback(notifications);
    });

    return () => off(notificationsRef, 'value', unsubscribe);
  }

  // Mark notification as read
  async markNotificationAsRead(userId: string, notificationId: string) {
    try {
      const notificationRef = ref(firebaseDb, `notifications/${userId}/${notificationId}/read`);
      await set(notificationRef, true);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // User Presence
  async setUserOnline(userId: string, userInfo: any) {
    try {
      const userStatusRef = ref(firebaseDb, `presence/${userId}`);
      await set(userStatusRef, {
        ...userInfo,
        status: 'online',
        lastSeen: serverTimestamp()
      });
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async setUserOffline(userId: string) {
    try {
      const userStatusRef = ref(firebaseDb, `presence/${userId}`);
      await update(userStatusRef, {
        status: 'offline',
        lastSeen: serverTimestamp()
      });
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Subscribe to user presence
  subscribeToUserPresence(userId: string, callback: (presence: any) => void) {
    const presenceRef = ref(firebaseDb, `presence/${userId}`);
    
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      callback(snapshot.val());
    });

    return () => off(presenceRef, 'value', unsubscribe);
  }

  // Real-time Order Tracking
  async updateOrderLocation(orderId: string, location: { lat: number; lng: number }) {
    try {
      const locationRef = ref(firebaseDb, `orderTracking/${orderId}/location`);
      await set(locationRef, {
        ...location,
        timestamp: serverTimestamp()
      });
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  subscribeToOrderTracking(orderId: string, callback: (location: any) => void) {
    const trackingRef = ref(firebaseDb, `orderTracking/${orderId}/location`);
    
    const unsubscribe = onValue(trackingRef, (snapshot) => {
      callback(snapshot.val());
    });

    return () => off(trackingRef, 'value', unsubscribe);
  }
}

export const firebaseRealtimeService = new FirebaseRealtimeService();