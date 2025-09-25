import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { firebaseAuthService } from '@/services/firebaseAuthService';
import { firebaseRealtimeService, type Notification } from '@/services/firebaseRealtimeService';
import { firestoreService, type Conversation } from '@/services/firestoreService';
import { firebaseMessagingService } from '@/services/firebaseMessagingService';
import { useAuth } from '@/contexts/AuthContext';

interface FirebaseContextType {
  firebaseUser: User | null;
  notifications: Notification[];
  conversations: Conversation[];
  unreadCount: number;
  fcmToken: string | null;
  signInWithGoogle: () => Promise<any>;
  signInWithFacebook: () => Promise<any>;
  signInWithPhone: (phone: string, recaptchaVerifier: any) => Promise<any>;
  signOutFirebase: () => Promise<any>;
  sendNotification: (notification: Notification) => Promise<any>;
  markNotificationAsRead: (notificationId: string) => Promise<any>;
  setUserOnline: (userInfo: any) => Promise<any>;
  setUserOffline: () => Promise<any>;
  // Firestore methods
  createConversation: (conversation: any) => Promise<any>;
  sendMessage: (message: any) => Promise<any>;
  markMessageAsRead: (messageId: string) => Promise<any>;
  // FCM methods
  initializeMessaging: () => Promise<any>;
  showLocalNotification: (notification: any) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const { user } = useAuth();

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChanged((user) => {
      setFirebaseUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to notifications when user is logged in
  useEffect(() => {
    if (user?.id) {
      // Subscribe to realtime notifications
      const unsubscribeRealtime = firebaseRealtimeService.subscribeToNotifications(
        user.id,
        (newNotifications) => {
          setNotifications(newNotifications);
        }
      );

      // Subscribe to Firestore conversations
      let unsubscribeConversations: (() => void) | null = null;
      
      const setupConversations = async () => {
        unsubscribeConversations = await firestoreService.getConversationsForUser(
          user.id,
          (newConversations) => {
            setConversations(newConversations);
          }
        );
      };
      
      setupConversations();

      return () => {
        unsubscribeRealtime();
        if (unsubscribeConversations) {
          unsubscribeConversations();
        }
      };
    }
  }, [user?.id]);

  // Initialize Firebase Cloud Messaging
  useEffect(() => {
    const initFCM = async () => {
      if (firebaseUser && user) {
        const { token, error } = await firebaseMessagingService.initializeMessaging();
        if (token) {
          setFcmToken(token);
          await firebaseMessagingService.saveTokenToServer(token, user.id);
        }
        if (error) {
          console.error('FCM initialization error:', error);
        }

        // Listen for foreground messages
        firebaseMessagingService.onForegroundMessage((payload) => {
          console.log('Foreground message received:', payload);
        });
      }
    };

    initFCM();
  }, [firebaseUser, user]);

  const signInWithGoogle = async () => {
    return await firebaseAuthService.signInWithGoogle();
  };

  const signInWithFacebook = async () => {
    return await firebaseAuthService.signInWithFacebook();
  };

  const signInWithPhone = async (phone: string, recaptchaVerifier: any) => {
    return await firebaseAuthService.signInWithPhone(phone, recaptchaVerifier);
  };

  const signOutFirebase = async () => {
    if (user?.id) {
      await firebaseRealtimeService.setUserOffline(user.id);
    }
    return await firebaseAuthService.signOut();
  };

  const sendNotification = async (notification: Notification) => {
    return await firebaseRealtimeService.sendNotification(notification);
  };

  const markNotificationAsRead = async (notificationId: string) => {
    if (user?.id) {
      return await firebaseRealtimeService.markNotificationAsRead(user.id, notificationId);
    }
    return { error: 'User not logged in' };
  };

  const setUserOnline = async (userInfo: any) => {
    if (user?.id) {
      return await firebaseRealtimeService.setUserOnline(user.id, userInfo);
    }
    return { error: 'User not logged in' };
  };

  const setUserOffline = async () => {
    if (user?.id) {
      return await firebaseRealtimeService.setUserOffline(user.id);
    }
    return { error: 'User not logged in' };
  };

  // Firestore methods
  const createConversation = async (conversation: any) => {
    return await firestoreService.createConversation(conversation);
  };

  const sendMessage = async (message: any) => {
    return await firestoreService.sendMessage(message);
  };

  const markMessageAsRead = async (messageId: string) => {
    return await firestoreService.markMessageAsRead(messageId);
  };

  // FCM methods
  const initializeMessaging = async () => {
    return await firebaseMessagingService.initializeMessaging();
  };

  const showLocalNotification = async (notification: any) => {
    return await firebaseMessagingService.showLocalNotification(notification);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: FirebaseContextType = {
    firebaseUser,
    notifications,
    conversations,
    unreadCount,
    fcmToken,
    signInWithGoogle,
    signInWithFacebook,
    signInWithPhone,
    signOutFirebase,
    sendNotification,
    markNotificationAsRead,
    setUserOnline,
    setUserOffline,
    createConversation,
    sendMessage,
    markMessageAsRead,
    initializeMessaging,
    showLocalNotification
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};