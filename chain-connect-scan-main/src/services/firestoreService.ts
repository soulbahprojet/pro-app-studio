import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  updateDoc, 
  doc, 
  deleteDoc, 
  where,
  serverTimestamp,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

export interface FirestoreMessage {
  id?: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: any;
  orderId?: string;
  conversationId: string;
  messageType: 'text' | 'image' | 'file' | 'location';
  read: boolean;
  metadata?: {
    imageUrl?: string;
    fileName?: string;
    fileSize?: number;
    location?: { lat: number; lng: number };
  };
}

export interface Conversation {
  id?: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: any;
  orderId?: string;
  type: 'order' | 'support' | 'general';
  metadata?: {
    orderNumber?: string;
    productName?: string;
  };
}

export class FirestoreService {
  // Collections references
  private messagesCollection = collection(firestore, 'messages');
  private conversationsCollection = collection(firestore, 'conversations');
  private notificationsCollection = collection(firestore, 'notifications');

  // Conversations Management
  async createConversation(conversation: Omit<Conversation, 'id'>) {
    try {
      const conversationData = {
        ...conversation,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(this.conversationsCollection, conversationData);
      return { conversationId: docRef.id, error: null };
    } catch (error: any) {
      return { conversationId: null, error: error.message };
    }
  }

  async getConversationsForUser(userId: string, callback: (conversations: Conversation[]) => void) {
    try {
      const q = query(
        this.conversationsCollection,
        where('participants', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const conversations: Conversation[] = [];
        querySnapshot.forEach((doc) => {
          conversations.push({
            id: doc.id,
            ...doc.data()
          } as Conversation);
        });
        callback(conversations);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error getting conversations:', error);
      return () => {};
    }
  }

  // Messages Management
  async sendMessage(message: Omit<FirestoreMessage, 'id'>) {
    try {
      const messageData = {
        ...message,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(this.messagesCollection, messageData);
      
      // Update conversation's last message
      await this.updateConversationLastMessage(
        message.conversationId, 
        message.content,
        message.senderId
      );
      
      return { messageId: docRef.id, error: null };
    } catch (error: any) {
      return { messageId: null, error: error.message };
    }
  }

  async getMessagesForConversation(
    conversationId: string, 
    callback: (messages: FirestoreMessage[]) => void,
    limitCount: number = 50
  ) {
    try {
      const q = query(
        this.messagesCollection,
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages: FirestoreMessage[] = [];
        querySnapshot.forEach((doc) => {
          messages.unshift({
            id: doc.id,
            ...doc.data()
          } as FirestoreMessage);
        });
        callback(messages);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error getting messages:', error);
      return () => {};
    }
  }

  async markMessageAsRead(messageId: string) {
    try {
      const messageRef = doc(this.messagesCollection, messageId);
      await updateDoc(messageRef, {
        read: true,
        readAt: serverTimestamp()
      });
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async markAllMessagesAsRead(conversationId: string, userId: string) {
    try {
      const q = query(
        this.messagesCollection,
        where('conversationId', '==', conversationId),
        where('senderId', '!=', userId),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, {
          read: true,
          readAt: serverTimestamp()
        })
      );

      await Promise.all(updatePromises);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  private async updateConversationLastMessage(
    conversationId: string, 
    lastMessage: string,
    senderId: string
  ) {
    try {
      const conversationRef = doc(this.conversationsCollection, conversationId);
      await updateDoc(conversationRef, {
        lastMessage,
        lastMessageAt: serverTimestamp(),
        lastSenderId: senderId,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  }

  // Notifications Management
  async sendNotification(notification: {
    userId: string;
    title: string;
    body: string;
    type: string;
    data?: any;
  }) {
    try {
      const notificationData = {
        ...notification,
        read: false,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(this.notificationsCollection, notificationData);
      return { notificationId: docRef.id, error: null };
    } catch (error: any) {
      return { notificationId: null, error: error.message };
    }
  }

  async getNotificationsForUser(
    userId: string, 
    callback: (notifications: any[]) => void,
    limitCount: number = 20
  ) {
    try {
      const q = query(
        this.notificationsCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notifications: any[] = [];
        querySnapshot.forEach((doc) => {
          notifications.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(notifications);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return () => {};
    }
  }

  async markNotificationAsRead(notificationId: string) {
    try {
      const notificationRef = doc(this.notificationsCollection, notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Utility Functions
  async deleteMessage(messageId: string) {
    try {
      const messageRef = doc(this.messagesCollection, messageId);
      await deleteDoc(messageRef);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async getConversationById(conversationId: string) {
    try {
      const conversationRef = doc(this.conversationsCollection, conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (conversationDoc.exists()) {
        return {
          conversation: {
            id: conversationDoc.id,
            ...conversationDoc.data()
          } as Conversation,
          error: null
        };
      } else {
        return { conversation: null, error: 'Conversation not found' };
      }
    } catch (error: any) {
      return { conversation: null, error: error.message };
    }
  }
}

export const firestoreService = new FirestoreService();