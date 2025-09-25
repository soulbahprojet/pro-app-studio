import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { supabase } from '@/integrations/supabase/client';

export class FirebaseAuthService {
  private googleProvider = new GoogleAuthProvider();
  private facebookProvider = new FacebookAuthProvider();

  // Email/Password Authentication
  async signInWithEmail(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
      return { user: result.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  }

  async signUpWithEmail(email: string, password: string) {
    try {
      const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      return { user: result.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  }

  // Google Authentication
  async signInWithGoogle() {
    try {
      // Configure Google provider for better UX
      this.googleProvider.addScope('email');
      this.googleProvider.addScope('profile');
      this.googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(firebaseAuth, this.googleProvider);
      return { user: result.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  }

  // Facebook Authentication
  async signInWithFacebook() {
    try {
      // Configure Facebook provider
      this.facebookProvider.addScope('email');
      this.facebookProvider.setCustomParameters({
        display: 'popup'
      });
      
      const result = await signInWithPopup(firebaseAuth, this.facebookProvider);
      return { user: result.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  }

  // Phone Authentication
  async setupRecaptcha(containerId: string) {
    try {
      const recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, containerId, {
        'size': 'normal',
        'callback': () => {
          console.log('reCAPTCHA solved');
        }
      });
      return recaptchaVerifier;
    } catch (error) {
      console.error('Error setting up reCAPTCHA:', error);
      throw error;
    }
  }

  async signInWithPhone(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) {
    try {
      const confirmationResult = await signInWithPhoneNumber(firebaseAuth, phoneNumber, recaptchaVerifier);
      return { confirmationResult, error: null };
    } catch (error: any) {
      return { confirmationResult: null, error: error.message };
    }
  }

  // Sign Out
  async signOut() {
    try {
      await signOut(firebaseAuth);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Auth State Observer
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(firebaseAuth, callback);
  }

  // Get current user
  getCurrentUser() {
    return firebaseAuth.currentUser;
  }

  // Admin functions via Edge Function
  async sendAdminNotification(tokens: string[], title: string, body: string, additionalData?: any) {
    try {
      const { data, error } = await supabase.functions.invoke('firebase-admin', {
        body: {
          action: 'send_notification',
          data: { tokens, title, body, additionalData }
        }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Error sending admin notification:', error);
      return { success: false, error: error.message };
    }
  }

  async verifyIdToken(idToken: string) {
    try {
      const { data, error } = await supabase.functions.invoke('firebase-admin', {
        body: {
          action: 'verify_token',
          data: { idToken }
        }
      });

      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error: any) {
      console.error('Error verifying token:', error);
      return { success: false, error: error.message };
    }
  }

  async createCustomToken(uid: string, claims?: any) {
    try {
      const { data, error } = await supabase.functions.invoke('firebase-admin', {
        body: {
          action: 'create_custom_token',
          data: { uid, claims }
        }
      });

      if (error) throw error;
      return { success: true, customToken: data.customToken };
    } catch (error: any) {
      console.error('Error creating custom token:', error);
      return { success: false, error: error.message };
    }
  }

  async manageUser(operation: 'create' | 'update' | 'delete' | 'disable' | 'enable', userData: any) {
    try {
      const { data, error } = await supabase.functions.invoke('firebase-admin', {
        body: {
          action: 'manage_user',
          data: { operation, userData }
        }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Error managing user:', error);
      return { success: false, error: error.message };
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService();