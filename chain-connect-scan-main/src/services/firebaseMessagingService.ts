import { firebaseMessaging } from '@/lib/firebase';
import { getToken, onMessage, type MessagePayload } from 'firebase/messaging';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  data?: { [key: string]: string };
  tag?: string;
  requireInteraction?: boolean;
}

export class FirebaseMessagingService {
  private vapidKey = 'YOUR_VAPID_KEY'; // À configurer dans la console Firebase

  // Initialize messaging and request permission
  async initializeMessaging() {
    if (!firebaseMessaging) {
      console.warn('Firebase Messaging not available');
      return { token: null, error: 'Messaging not available' };
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Get registration token
        const token = await getToken(firebaseMessaging, {
          vapidKey: this.vapidKey
        });
        
        console.log('FCM Token:', token);
        return { token, error: null };
      } else {
        return { token: null, error: 'Notification permission denied' };
      }
    } catch (error: any) {
      console.error('Error getting FCM token:', error);
      return { token: null, error: error.message };
    }
  }

  // Listen for foreground messages
  onForegroundMessage(callback: (payload: MessagePayload) => void) {
    if (!firebaseMessaging) {
      console.warn('Firebase Messaging not available');
      return () => {};
    }

    const unsubscribe = onMessage(firebaseMessaging, (payload) => {
      console.log('Foreground message received:', payload);
      
      // Show notification if app is in foreground
      if (payload.notification) {
        this.showLocalNotification({
          title: payload.notification.title || 'Nouvelle notification',
          body: payload.notification.body || '',
          icon: payload.notification.icon,
          image: payload.notification.image,
          data: payload.data,
          tag: payload.data?.tag,
          requireInteraction: true
        });
      }
      
      callback(payload);
    });

    return unsubscribe;
  }

  // Show local notification
  async showLocalNotification(notification: NotificationPayload) {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      try {
        const options: NotificationOptions = {
          body: notification.body,
          icon: notification.icon || '/favicon.ico',
          data: notification.data,
          tag: notification.tag,
          requireInteraction: notification.requireInteraction || false
        };

        const notificationInstance = new Notification(notification.title, options);
        
        // Handle notification click
        notificationInstance.onclick = (event) => {
          event.preventDefault();
          window.focus();
          
          // Handle navigation based on notification data
          if (notification.data?.url) {
            window.location.href = notification.data.url;
          }
          
          notificationInstance.close();
        };

        // Auto close after 5 seconds if not requiring interaction
        if (!notification.requireInteraction) {
          setTimeout(() => {
            notificationInstance.close();
          }, 5000);
        }

      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  }

  // Send token to server for push notifications
  async saveTokenToServer(token: string, userId: string) {
    try {
      // Here you would typically send the token to your backend
      // For now, we'll save it to local storage and Firestore
      localStorage.setItem('fcm_token', token);
      
      // You can also save to Firestore for server-side push notifications
      // This would require a separate function to handle server-side operations
      
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get stored token
  getStoredToken(): string | null {
    return localStorage.getItem('fcm_token');
  }

  // Handle notification types
  handleNotificationAction(payload: MessagePayload, action?: string) {
    const { data, notification } = payload;
    
    switch (data?.type) {
      case 'new_message':
        // Navigate to messages
        window.location.href = `/messages?conversation=${data.conversationId}`;
        break;
        
      case 'order_update':
        // Navigate to order tracking
        window.location.href = `/order-tracking?order=${data.orderId}`;
        break;
        
      case 'payment_update':
        // Navigate to wallet
        window.location.href = `/wallet`;
        break;
        
      case 'delivery_update':
        // Navigate to tracking
        window.location.href = `/tracking?shipment=${data.shipmentId}`;
        break;
        
      default:
        // Default action - go to home or relevant dashboard
        window.location.href = '/';
    }
  }

  // Register service worker for background notifications
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered:', registration);
        return { registration, error: null };
      } catch (error: any) {
        console.error('Service Worker registration failed:', error);
        return { registration: null, error: error.message };
      }
    } else {
      return { registration: null, error: 'Service Worker not supported' };
    }
  }

  // Update VAPID key (call this when you get the key from Firebase Console)
  updateVapidKey(vapidKey: string) {
    this.vapidKey = vapidKey;
  }
}

export const firebaseMessagingService = new FirebaseMessagingService();