import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const firebaseAuth = getAuth(app);
export const firebaseDb = getDatabase(app);
export const firestore = getFirestore(app);
export const firebaseStorage = getStorage(app);

// Initialize Firebase Cloud Messaging (only in browser environment)
let firebaseMessaging: any = null;
if (typeof window !== 'undefined') {
  try {
    firebaseMessaging = getMessaging(app);
  } catch (error) {
    console.log('Firebase Messaging not available:', error);
  }
}
export { firebaseMessaging };

// Development mode - connect to emulators
if (import.meta.env.DEV) {
  // Uncomment these lines when using Firebase emulators in development
  // connectAuthEmulator(firebaseAuth, "http://localhost:9099");
  // connectDatabaseEmulator(firebaseDb, "localhost", 9000);
  // connectFirestoreEmulator(firestore, "localhost", 8080);
  // connectStorageEmulator(firebaseStorage, "localhost", 9199);
}

export default app;