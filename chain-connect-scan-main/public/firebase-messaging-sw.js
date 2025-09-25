// Firebase Messaging Service Worker
// This file needs to be placed in the public folder as firebase-messaging-sw.js

import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

// Initialize Firebase in service worker
const firebaseConfig = {
  apiKey: "AIzaSyBVqFfOJJbRPG1ZvjiFOpYZ01hfpqr6FVI",
  authDomain: "solutions-ai-app-a8d57.firebaseapp.com",
  databaseURL: "https://solutions-ai-app-a8d57-default-rtdb.firebaseio.com",
  projectId: "solutions-ai-app-a8d57",
  storageBucket: "solutions-ai-app-a8d57.appspot.com",
  messagingSenderId: "561608626006",
  appId: "1:561608626006:web:224solutions",
  measurementId: "G-MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Handle background messages
onBackgroundMessage(messaging, (payload) => {
  console.log('Background message received:', payload);

  const { title, body, icon, image } = payload.notification || {};
  const { data } = payload;

  // Customize notification
  const notificationTitle = title || '224Solutions';
  const notificationOptions = {
    body: body || 'Vous avez une nouvelle notification',
    icon: icon || '/favicon.ico',
    image: image,
    data: data,
    tag: data?.tag || 'default',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Voir',
        icon: '/icons/view.png'
      },
      {
        action: 'close',
        title: 'Fermer', 
        icon: '/icons/close.png'
      }
    ]
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const { action, notification } = event;
  const { data } = notification;

  if (action === 'close') {
    return;
  }

  // Handle different notification types
  let url = '/';
  
  switch (data?.type) {
    case 'new_message':
      url = `/messages?conversation=${data.conversationId}`;
      break;
    case 'order_update':
      url = `/order-tracking?order=${data.orderId}`;
      break;
    case 'payment_update':
      url = `/wallet`;
      break;
    case 'delivery_update':
      url = `/tracking?shipment=${data.shipmentId}`;
      break;
    default:
      url = data?.url || '/';
  }

  // Open the app with the appropriate URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus and navigate
      for (const client of clientList) {
        if (client.url === new URL(url, self.location.origin).href && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If app is not open, open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // Track notification closure for analytics
  const { data } = event.notification;
  if (data?.trackingId) {
    // You can send analytics data here
    console.log('Tracking notification close:', data.trackingId);
  }
});