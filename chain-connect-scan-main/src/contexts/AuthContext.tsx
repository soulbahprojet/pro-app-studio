import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'client' | 'seller' | 'courier' | 'transitaire' | 'admin' | 'taxi_moto';
  avatar_url: string | null;
  address: string | null;
  country: string | null;
  language: string;
  subscription_plan: 'basic' | 'standard' | 'premium';
  subscription_expires_at: string | null;
  is_verified: boolean;
  kyc_status: string;
  vehicle_type?: 'moto' | 'voiture';
  union_type?: 'syndicat_moto' | 'syndicat_voiture';
  gps_verified?: boolean;
  gps_country?: string;
  readable_id: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, userData: RegisterData) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateUserStatus: (online: boolean) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

interface RegisterData {
  fullName: string;
  phone?: string;
  role: 'client' | 'seller' | 'courier' | 'transitaire' | 'admin' | 'taxi_moto';
  country?: string;
  address?: string;
  vehicleType?: string;
  unionType?: string;
  gpsVerified?: boolean;
  gpsCountry?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Setting up auth listener');
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, !!session, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('Session exists, fetching profile for user:', session.user.id);
          // Fetch profile immediately to avoid race conditions
          fetchUserProfile(session.user.id);
        } else {
          console.log('No session, clearing profile and setting loading to false');
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const getInitialSession = async () => {
      console.log('Getting initial session...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Initial session result:', !!session, session?.user?.id, error);
        
        if (error) {
          console.error('Error getting initial session:', error);
          setLoading(false);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('Initial session has user, fetching profile:', session.user.id);
          await fetchUserProfile(session.user.id);
        } else {
          console.log('No initial session, setting loading to false');
          setLoading(false);
        }
      } catch (error) {
        console.error('Exception getting initial session:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      console.log('Unsubscribing from auth state changes');
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for userId:', userId);
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === 'PGRST116') {
          console.log('No profile found, creating from user metadata');
          await createProfileFromUserMetadata(userId);
        } else {
          setProfile(null);
        }
      } else {
        console.log('Profile fetched successfully:', profileData);
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      setProfile(null);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const createProfileFromUserMetadata = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userData = user.user_metadata;
      console.log('Creating profile from metadata:', userData);

      const profileData = {
        user_id: userId,
        email: userData.email || user.email,
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        role: userData.role || 'client',
        country: userData.country || '',
        address: userData.address || '',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        setProfile(null);
      } else {
        console.log('Profile created successfully:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error creating profile from metadata:', error);
      setProfile(null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        
        // Si l'erreur est "email not confirmed", essayer de renvoyer l'email de confirmation
        if (error.message === 'Email not confirmed') {
          console.log('Email not confirmed, attempting to resend confirmation');
          await supabase.auth.resend({
            type: 'signup',
            email: email
          });
          
          toast({
            title: "Email de confirmation renvoyé",
            description: "Un nouvel email de confirmation a été envoyé. Vérifiez votre boîte email.",
            duration: 10000,
          });
        } else {
          toast({
            title: "Erreur de connexion",
            description: error.message,
            variant: "destructive",
          });
        }
        return { error: error.message };
      }

      console.log('Login successful:', data);
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté",
      });

      return {};
    } catch (error: any) {
      console.error('Login catch error:', error);
      return { error: error.message };
    }
  };

  const register = async (email: string, password: string, userData: RegisterData) => {
    try {
      console.log('Starting registration with data:', userData);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: userData.fullName,
            phone: userData.phone,
            role: userData.role,
            country: userData.country,
            address: userData.address,
            vehicle_type: userData.vehicleType,
            union_type: userData.unionType,
            gps_verified: userData.gpsVerified || false,
            gps_country: userData.gpsCountry,
            email_verified: true,
            phone_verified: false
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive",
        });
        return { error: error.message };
      }

      if (data.user && !data.session) {
        console.log('Registration successful, user created:', data.user.id);
        console.log('Email confirmation required');
        
        toast({
          title: "📧 Inscription réussie !",
          description: "Veuillez vérifier votre email et cliquer sur le lien de confirmation pour activer votre compte.",
          duration: 10000,
        });
      } else if (data.user && data.session) {
        console.log('Registration successful with immediate session:', data.user.id);
        
        toast({
          title: "✅ Inscription réussie !",
          description: "Votre compte a été créé et activé avec succès !",
        });
      }

      return {};
    } catch (error: any) {
      console.error('Registration catch error:', error);
      return { error: error.message };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: "Erreur de déconnexion",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Reset local states
        setUser(null);
        setSession(null);
        setProfile(null);
        setLoading(false);
        
        toast({
          title: "Déconnexion réussie",
          description: "Vous avez été déconnecté",
        });
        
        // Redirect to auth page after a short delay
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1000);
      }
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  const updateUserStatus = (online: boolean) => {
    // This can be implemented later with real-time presence if needed
    console.log('User status updated:', online);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        login,
        register,
        logout,
        updateUserStatus,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};