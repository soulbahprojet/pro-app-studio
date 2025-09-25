import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Shield, User, Store, Truck, Globe, ArrowLeft, Bike } from 'lucide-react';
import { COUNTRIES, POPULAR_COUNTRIES } from '@/utils/countries';
import { supabase } from '@/integrations/supabase/client';

const SimpleAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, login, user, profile, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Login form
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  
  // Register form
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    phoneDialCode: '+224', // Code par défaut pour la Guinée
    country: 'GN', // Pays par défaut: Guinée
    address: '',
    role: 'client' as 'client' | 'seller' | 'courier' | 'transitaire' | 'taxi_moto' | 'admin',
    // Champs spécifiques selon le rôle
    businessName: '', // Pour marchands
    vehicleType: '', // Pour livreurs
    vehiclePlate: '', // Pour livreurs
    companyRegistration: '', // Pour transitaires
  });

  // Rediriger l'utilisateur connecté selon son rôle
  useEffect(() => {
    if (user && !authLoading) {
      // Attendre que le profil soit chargé pour rediriger correctement
      if (profile) {
        const redirections = {
          'client': '/client-home',
          'seller': '/vendor-dashboard',
          'courier': '/courier-dashboard',
          'taxi_moto': '/moto-dashboard',
          'transitaire': '/freight',
          'admin': '/admin-dashboard'
        };
        
        const targetRoute = redirections[profile.role as keyof typeof redirections] || '/client-home';
        console.log(`SimpleAuth: Redirecting ${profile.role} to ${targetRoute}`);
        navigate(targetRoute, { replace: true });
      }
    }
  }, [user, profile, authLoading, navigate]);

  // Détecter si on vient d'un lien de réinitialisation
  useEffect(() => {
    const isReset = searchParams.get('reset') === 'true';
    if (isReset) {
      setShowResetPassword(true);
    }
  }, [searchParams]);

  // Afficher un loader pendant la vérification de l'auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Vérification...</p>
        </div>
      </div>
    );
  }

  // Rediriger immédiatement si connecté
  if (user) {
    return <Navigate to="/profile" replace />;
  }

  // Fonction pour mettre à jour l'indicatif quand le pays change
  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRIES.find(c => c.code === countryCode);
    setRegisterForm(prev => ({
      ...prev,
      country: countryCode,
      phoneDialCode: country?.dialCode || '+224'
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await login(loginForm.email, loginForm.password);
      if (!result.error) {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Préparer les métadonnées selon le rôle
      const userMetadata: any = {
        fullName: registerForm.fullName,
        phone: `${registerForm.phoneDialCode}${registerForm.phone}`,
        role: registerForm.role,
        country: registerForm.country,
        address: registerForm.address,
      };

      // Ajouter les données spécifiques pour les coursiers et taxi-motos
      if (registerForm.role === 'courier' || registerForm.role === 'taxi_moto') {
        userMetadata.vehicle_type = registerForm.vehicleType || 'moto';
        userMetadata.vehicle_plate = registerForm.vehiclePlate;
      }

      const result = await register(registerForm.email, registerForm.password, userMetadata);
      
      if (!result.error) {
        toast({
          title: "✅ Inscription réussie !",
          description: "Veuillez vérifier votre boîte email et cliquer sur le lien de confirmation pour activer votre compte.",
          duration: 8000,
        });
        
        // Afficher une alerte plus visible
        alert("🎉 Inscription réussie !\n\nVeuillez vérifier votre boîte email (y compris le dossier spam) et cliquer sur le lien de confirmation pour activer votre compte.");
      }
    } catch (error) {
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      
      if (error) {
        toast({
          title: "❌ Erreur",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "✅ Email envoyé !",
          description: "Vérifiez votre boîte email pour réinitialiser votre mot de passe.",
          duration: 5000,
        });
        setShowForgotPassword(false);
        setResetEmail('');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        title: "❌ Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "❌ Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "❌ Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        toast({
          title: "❌ Erreur",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "✅ Mot de passe modifié !",
          description: "Votre mot de passe a été mis à jour avec succès.",
          duration: 5000,
        });
        setShowResetPassword(false);
        setNewPassword('');
        setConfirmPassword('');
        navigate('/');
      }
    } catch (error) {
      console.error('Update password error:', error);
      toast({
        title: "❌ Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/50 to-primary/5 p-4">
      
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center relative">
          <CardTitle className="text-2xl bg-gradient-hero bg-clip-text text-transparent">
            224SOLUTIONS
          </CardTitle>
          
          {/* Boutons de navigation */}
          <div className="flex items-center justify-center space-x-16 my-4">
            <Link 
              to="/" 
              className="px-3 py-1.5 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Accueil
            </Link>
            <Link 
              to="/client-home" 
              className="px-3 py-1.5 text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Marketplace
            </Link>
            <Link 
              to="/services" 
              className="px-3 py-1.5 text-sm font-semibold bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Services
            </Link>
          </div>
          
          <CardDescription>
            Authentification avec Supabase
          </CardDescription>
          
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Interface de réinitialisation de mot de passe */}
          {showResetPassword ? (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nouveau mot de passe</h3>
                <p className="text-sm text-muted-foreground">
                  Entrez votre nouveau mot de passe pour finaliser la réinitialisation.
                </p>
              </div>
              
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading} variant="hero">
                  {loading ? 'Mise à jour en cours...' : 'Mettre à jour le mot de passe'}
                </Button>
              </form>
            </div>
          ) : (
            <>
              {/* Sélecteur de type de compte interactif */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-6 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Choisissez votre profil professionnel
                </h3>
                
                {/* Section Commerce & Services */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-green-500 rounded-full mr-3"></div>
                      <h4 className="text-sm font-semibold text-foreground tracking-wide">Commerce & Services</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
                        onClick={() => setRegisterForm({...registerForm, role: 'client'})}
                        className={`group relative overflow-hidden flex items-center space-x-4 p-5 rounded-2xl border-2 transition-all duration-300 transform ${
                          registerForm.role === 'client' 
                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-xl scale-105 ring-2 ring-blue-200' 
                            : 'border-border bg-card hover:border-blue-300 hover:shadow-lg hover:scale-102'
                        }`}
                      >
                        <div className={`relative z-10 p-3 rounded-xl transition-all duration-300 ${
                          registerForm.role === 'client' 
                            ? 'bg-blue-500 shadow-lg' 
                            : 'bg-blue-100 group-hover:bg-blue-200 group-hover:shadow-md'
                        }`}>
                          <User className={`w-6 h-6 transition-colors ${
                            registerForm.role === 'client' ? 'text-white' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="text-left flex-1 relative z-10">
                          <p className="font-semibold text-base mb-1">Client</p>
                          <p className="text-sm text-muted-foreground">Acheter des produits et services</p>
                        </div>
                        {registerForm.role === 'client' && (
                          <div className="relative z-10">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                      
                      <button 
                        onClick={() => setRegisterForm({...registerForm, role: 'seller'})}
                        className={`group relative overflow-hidden flex items-center space-x-4 p-5 rounded-2xl border-2 transition-all duration-300 transform ${
                          registerForm.role === 'seller' 
                            ? 'border-green-500 bg-gradient-to-r from-green-50 to-green-100 shadow-xl scale-105 ring-2 ring-green-200' 
                            : 'border-border bg-card hover:border-green-300 hover:shadow-lg hover:scale-102'
                        }`}
                      >
                        <div className={`relative z-10 p-3 rounded-xl transition-all duration-300 ${
                          registerForm.role === 'seller' 
                            ? 'bg-green-500 shadow-lg' 
                            : 'bg-green-100 group-hover:bg-green-200 group-hover:shadow-md'
                        }`}>
                          <Store className={`w-6 h-6 transition-colors ${
                            registerForm.role === 'seller' ? 'text-white' : 'text-green-600'
                          }`} />
                        </div>
                        <div className="text-left flex-1 relative z-10">
                          <p className="font-semibold text-base mb-1">Marchand</p>
                          <p className="text-sm text-muted-foreground">Gérer une boutique en ligne</p>
                        </div>
                        {registerForm.role === 'seller' && (
                          <div className="relative z-10">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    </div>
                  </div>

                  {/* Section Transport & Logistique */}
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-yellow-500 rounded-full mr-3"></div>
                      <h4 className="text-sm font-semibold text-foreground tracking-wide">Transport & Logistique</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
                        onClick={() => setRegisterForm({...registerForm, role: 'courier'})}
                        className={`group relative overflow-hidden flex items-center space-x-4 p-5 rounded-2xl border-2 transition-all duration-300 transform ${
                          registerForm.role === 'courier' 
                            ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 shadow-xl scale-105 ring-2 ring-orange-200' 
                            : 'border-border bg-card hover:border-orange-300 hover:shadow-lg hover:scale-102'
                        }`}
                      >
                        <div className={`relative z-10 p-3 rounded-xl transition-all duration-300 ${
                          registerForm.role === 'courier' 
                            ? 'bg-orange-500 shadow-lg' 
                            : 'bg-orange-100 group-hover:bg-orange-200 group-hover:shadow-md'
                        }`}>
                          <Truck className={`w-6 h-6 transition-colors ${
                            registerForm.role === 'courier' ? 'text-white' : 'text-orange-600'
                          }`} />
                        </div>
                        <div className="text-left flex-1 relative z-10">
                          <p className="font-semibold text-base mb-1">Livreur</p>
                          <p className="text-sm text-muted-foreground">Service de livraison rapide</p>
                        </div>
                        {registerForm.role === 'courier' && (
                          <div className="relative z-10">
                            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>

                      <button 
                        onClick={() => setRegisterForm({...registerForm, role: 'taxi_moto'})}
                        className={`group relative overflow-hidden flex items-center space-x-4 p-5 rounded-2xl border-2 transition-all duration-300 transform ${
                          registerForm.role === 'taxi_moto' 
                            ? 'border-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-100 shadow-xl scale-105 ring-2 ring-yellow-200' 
                            : 'border-border bg-card hover:border-yellow-300 hover:shadow-lg hover:scale-102'
                        }`}
                      >
                        <div className={`relative z-10 p-3 rounded-xl transition-all duration-300 ${
                          registerForm.role === 'taxi_moto' 
                            ? 'bg-yellow-500 shadow-lg' 
                            : 'bg-yellow-100 group-hover:bg-yellow-200 group-hover:shadow-md'
                        }`}>
                          <Bike className={`w-6 h-6 transition-colors ${
                            registerForm.role === 'taxi_moto' ? 'text-white' : 'text-yellow-600'
                          }`} />
                        </div>
                        <div className="text-left flex-1 relative z-10">
                          <p className="font-semibold text-base mb-1">Moto-Taxi</p>
                          <p className="text-sm text-muted-foreground">Transport de personnes</p>
                        </div>
                        {registerForm.role === 'taxi_moto' && (
                          <div className="relative z-10">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    </div>
                  </div>

                  {/* Section International */}
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full mr-3"></div>
                      <h4 className="text-sm font-semibold text-foreground tracking-wide">International</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <button 
                        onClick={() => setRegisterForm({...registerForm, role: 'transitaire'})}
                        className={`group relative overflow-hidden flex items-center space-x-4 p-5 rounded-2xl border-2 transition-all duration-300 transform ${
                          registerForm.role === 'transitaire' 
                            ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 shadow-xl scale-105 ring-2 ring-purple-200' 
                            : 'border-border bg-card hover:border-purple-300 hover:shadow-lg hover:scale-102'
                        }`}
                      >
                        <div className={`relative z-10 p-3 rounded-xl transition-all duration-300 ${
                          registerForm.role === 'transitaire' 
                            ? 'bg-purple-500 shadow-lg' 
                            : 'bg-purple-100 group-hover:bg-purple-200 group-hover:shadow-md'
                        }`}>
                          <Globe className={`w-6 h-6 transition-colors ${
                            registerForm.role === 'transitaire' ? 'text-white' : 'text-purple-600'
                          }`} />
                        </div>
                        <div className="text-left flex-1 relative z-10">
                          <p className="font-semibold text-base mb-1">Transitaire</p>
                          <p className="text-sm text-muted-foreground">Logistique internationale et douanes</p>
                        </div>
                        {registerForm.role === 'transitaire' && (
                          <div className="relative z-10">
                            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="login" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Connexion</TabsTrigger>
                  <TabsTrigger value="register">Inscription</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  {/* Indicateur visuel du type de compte pour la connexion */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 text-center">
                      <strong>💡 Information :</strong> Utilisez vos identifiants habituels. Le système reconnaîtra automatiquement votre type de compte (Client, Marchand, Livreur, ou Transitaire).
                    </p>
                  </div>
                  
                  {!showForgotPassword ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="votre@email.com"
                            className="pl-10"
                            value={loginForm.email}
                            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            value={loginForm.password}
                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <Button type="submit" className="w-full" disabled={loading} variant="hero">
                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                      </Button>
                      
                      {/* Lien mot de passe oublié */}
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-sm text-primary hover:underline"
                        >
                          Mot de passe oublié ?
                        </button>
                      </div>
                      
                       {/* Rappel des types de comptes */}
                       <div className="text-xs text-center text-muted-foreground mt-3">
                         Après connexion, vous serez dirigé vers votre espace selon votre type de compte
                       </div>
                       
                     </form>
                  ) : (
                    /* Interface de réinitialisation de mot de passe */
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <button
                          onClick={() => setShowForgotPassword(false)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <h3 className="text-lg font-semibold">Réinitialiser le mot de passe</h3>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                      </p>
                      
                      <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                              id="reset-email"
                              type="email"
                              placeholder="votre@email.com"
                              className="pl-10"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        
                        <Button type="submit" className="w-full" disabled={loading} variant="hero">
                          {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                        </Button>
                        
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(false)}
                            className="text-sm text-muted-foreground hover:text-foreground"
                          >
                            Retour à la connexion
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="register">
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold mb-2">Choisissez votre type de compte</h3>
                      <p className="text-sm text-muted-foreground">Sélectionnez le type de compte qui correspond à votre activité</p>
                    </div>
                    
                    <Tabs defaultValue="client" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                        <TabsTrigger value="client" className="flex flex-col items-center py-3 px-2">
                          <User className="w-4 h-4 mb-1" />
                          <span className="text-xs">Client</span>
                        </TabsTrigger>
                        <TabsTrigger value="seller" className="flex flex-col items-center py-3 px-2">
                          <Store className="w-4 h-4 mb-1" />
                          <span className="text-xs">Marchand</span>
                        </TabsTrigger>
                        <TabsTrigger value="courier" className="flex flex-col items-center py-3 px-2">
                          <Truck className="w-4 h-4 mb-1" />
                          <span className="text-xs">Livreur</span>
                        </TabsTrigger>
                        <TabsTrigger value="transitaire" className="flex flex-col items-center py-3 px-2">
                          <Globe className="w-4 h-4 mb-1" />
                          <span className="text-xs">Transitaire</span>
                        </TabsTrigger>
                      </TabsList>
                      
                      {/* Client Registration */}
                      <TabsContent value="client">
                        <div className="p-4 bg-blue-50 rounded-lg mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <User className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold text-blue-800">Compte Client</h4>
                          </div>
                          <p className="text-sm text-blue-600">Achetez des produits et suivez vos commandes</p>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); setRegisterForm({...registerForm, role: 'client'}); handleRegister(e); }} className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="client-name">Nom complet</Label>
                              <Input
                                id="client-name"
                                placeholder="Votre nom"
                                value={registerForm.fullName}
                                onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="client-phone">Téléphone</Label>
                              <div className="flex">
                                <Select
                                  value={registerForm.phoneDialCode}
                                  onValueChange={(value) => {
                                    const country = COUNTRIES.find(c => c.dialCode === value);
                                    setRegisterForm({
                                      ...registerForm,
                                      phoneDialCode: value,
                                      country: country?.code || 'GN'
                                    });
                                  }}
                                >
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {POPULAR_COUNTRIES.map((countryCode) => {
                                      const country = COUNTRIES.find(c => c.code === countryCode);
                                      return country ? (
                                        <SelectItem key={country.code} value={country.dialCode}>
                                          <span className="flex items-center">
                                            <span className="mr-2">{country.flag}</span>
                                            {country.dialCode}
                                          </span>
                                        </SelectItem>
                                      ) : null;
                                    })}
                                  </SelectContent>
                                </Select>
                                <Input
                                  id="client-phone"
                                  type="tel"
                                  placeholder="123456789"
                                  className="flex-1 ml-2"
                                  value={registerForm.phone}
                                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="client-email">Email</Label>
                              <Input
                                id="client-email"
                                type="email"
                                placeholder="votre@email.com"
                                value={registerForm.email}
                                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="client-password">Mot de passe</Label>
                              <div className="relative">
                                <Input
                                  id="client-password"
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  className="pr-10"
                                  value={registerForm.password}
                                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                  required
                                  minLength={6}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="client-country">Pays</Label>
                            <Select
                              value={registerForm.country}
                              onValueChange={handleCountryChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez votre pays" />
                              </SelectTrigger>
                              <SelectContent>
                                {COUNTRIES.map((country) => (
                                  <SelectItem key={country.code} value={country.code}>
                                    <span className="flex items-center">
                                      <span className="mr-2">{country.flag}</span>
                                      {country.name}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="client-address">Adresse</Label>
                            <Input
                              id="client-address"
                              placeholder="Votre adresse complète"
                              value={registerForm.address}
                              onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                            />
                          </div>
                          
                          <Button type="submit" className="w-full" disabled={loading} variant="hero">
                            {loading ? 'Inscription en cours...' : 'Créer un compte Client'}
                          </Button>
                        </form>
                      </TabsContent>
                      
                      {/* Seller Registration */}
                      <TabsContent value="seller">
                        <div className="p-4 bg-green-50 rounded-lg mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Store className="w-5 h-5 text-green-600" />
                            <h4 className="font-semibold text-green-800">Compte Marchand</h4>
                          </div>
                          <p className="text-sm text-green-600">Vendez vos produits et gérez votre boutique</p>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); setRegisterForm({...registerForm, role: 'seller'}); handleRegister(e); }} className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="seller-name">Nom complet</Label>
                              <Input
                                id="seller-name"
                                placeholder="Votre nom"
                                value={registerForm.fullName}
                                onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="seller-business">Nom de l'entreprise</Label>
                              <Input
                                id="seller-business"
                                placeholder="Nom de votre boutique"
                                value={registerForm.businessName}
                                onChange={(e) => setRegisterForm({ ...registerForm, businessName: e.target.value })}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="seller-phone">Téléphone</Label>
                            <div className="flex">
                              <Select
                                value={registerForm.phoneDialCode}
                                onValueChange={(value) => {
                                  const country = COUNTRIES.find(c => c.dialCode === value);
                                  setRegisterForm({
                                    ...registerForm,
                                    phoneDialCode: value,
                                    country: country?.code || 'GN'
                                  });
                                }}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {POPULAR_COUNTRIES.map((countryCode) => {
                                    const country = COUNTRIES.find(c => c.code === countryCode);
                                    return country ? (
                                      <SelectItem key={country.code} value={country.dialCode}>
                                        <span className="flex items-center">
                                          <span className="mr-2">{country.flag}</span>
                                          {country.dialCode}
                                        </span>
                                      </SelectItem>
                                    ) : null;
                                  })}
                                </SelectContent>
                              </Select>
                              <Input
                                id="seller-phone"
                                type="tel"
                                placeholder="123456789"
                                className="flex-1 ml-2"
                                value={registerForm.phone}
                                onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="seller-email">Email</Label>
                              <Input
                                id="seller-email"
                                type="email"
                                placeholder="votre@email.com"
                                value={registerForm.email}
                                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="seller-password">Mot de passe</Label>
                              <div className="relative">
                                <Input
                                  id="seller-password"
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  className="pr-10"
                                  value={registerForm.password}
                                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                  required
                                  minLength={6}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="seller-country">Pays</Label>
                            <Select
                              value={registerForm.country}
                              onValueChange={handleCountryChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez votre pays" />
                              </SelectTrigger>
                              <SelectContent>
                                {COUNTRIES.map((country) => (
                                  <SelectItem key={country.code} value={country.code}>
                                    <span className="flex items-center">
                                      <span className="mr-2">{country.flag}</span>
                                      {country.name}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="seller-address">Adresse</Label>
                            <Input
                              id="seller-address"
                              placeholder="Adresse de votre entreprise"
                              value={registerForm.address}
                              onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                            />
                          </div>
                          
                          <Button type="submit" className="w-full" disabled={loading} variant="hero">
                            {loading ? 'Inscription en cours...' : 'Créer un compte Marchand'}
                          </Button>
                        </form>
                      </TabsContent>
                      
                      {/* Courier Registration */}
                      <TabsContent value="courier">
                        <div className="p-4 bg-orange-50 rounded-lg mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Truck className="w-5 h-5 text-orange-600" />
                            <h4 className="font-semibold text-orange-800">Compte Livreur</h4>
                          </div>
                          <p className="text-sm text-orange-600">Livrez des colis et gérez vos tournées</p>
                        </div>
        <form onSubmit={(e) => { 
          e.preventDefault(); 
          setRegisterForm({...registerForm, role: 'courier' as const}); 
          handleRegister(e); 
        }} className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="courier-name">Nom complet</Label>
                              <Input
                                id="courier-name"
                                placeholder="Votre nom"
                                value={registerForm.fullName}
                                onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="courier-vehicle">Type de véhicule</Label>
                              <Select
                                value={registerForm.vehicleType}
                                onValueChange={(value) => setRegisterForm({ ...registerForm, vehicleType: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Votre véhicule" />
                                </SelectTrigger>
                                 <SelectContent>
                                   <SelectItem key="courier-vehicle-moto" value="moto">🏍️ Moto</SelectItem>
                                   <SelectItem key="courier-vehicle-voiture" value="voiture">🚗 Voiture</SelectItem>
                                   <SelectItem key="courier-vehicle-camionnette" value="camionnette">🚐 Camionnette</SelectItem>
                                   <SelectItem key="courier-vehicle-camion" value="camion">🚛 Camion</SelectItem>
                                   <SelectItem key="courier-vehicle-velo" value="velo">🚲 Vélo</SelectItem>
                                 </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="courier-plate">Plaque d'immatriculation</Label>
                            <Input
                              id="courier-plate"
                              placeholder="Numéro de plaque"
                              value={registerForm.vehiclePlate}
                              onChange={(e) => setRegisterForm({ ...registerForm, vehiclePlate: e.target.value })}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="courier-phone">Téléphone</Label>
                            <div className="flex">
                              <Select
                                value={registerForm.phoneDialCode}
                                onValueChange={(value) => {
                                  const country = COUNTRIES.find(c => c.dialCode === value);
                                  setRegisterForm({
                                    ...registerForm,
                                    phoneDialCode: value,
                                    country: country?.code || 'GN'
                                  });
                                }}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                 <SelectContent>
                                   {POPULAR_COUNTRIES.map((countryCode, index) => {
                                     const country = COUNTRIES.find(c => c.code === countryCode);
                                     return country ? (
                                       <SelectItem key={`courier-dial-${country.code}-${index}`} value={country.dialCode}>
                                         <span className="flex items-center">
                                           <span className="mr-2">{country.flag}</span>
                                           {country.dialCode}
                                         </span>
                                       </SelectItem>
                                     ) : null;
                                   })}
                                 </SelectContent>
                              </Select>
                              <Input
                                id="courier-phone"
                                type="tel"
                                placeholder="123456789"
                                className="flex-1 ml-2"
                                value={registerForm.phone}
                                onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="courier-email">Email</Label>
                              <Input
                                id="courier-email"
                                type="email"
                                placeholder="votre@email.com"
                                value={registerForm.email}
                                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="courier-password">Mot de passe</Label>
                              <div className="relative">
                                <Input
                                  id="courier-password"
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  className="pr-10"
                                  value={registerForm.password}
                                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                  required
                                  minLength={6}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="courier-country">Pays</Label>
                            <Select
                              value={registerForm.country}
                              onValueChange={handleCountryChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez votre pays" />
                              </SelectTrigger>
                               <SelectContent>
                                 {COUNTRIES.map((country, index) => (
                                   <SelectItem key={`courier-country-${country.code}-${index}`} value={country.code}>
                                     <span className="flex items-center">
                                       <span className="mr-2">{country.flag}</span>
                                       {country.name}
                                     </span>
                                   </SelectItem>
                                 ))}
                               </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="courier-address">Adresse</Label>
                            <Input
                              id="courier-address"
                              placeholder="Votre adresse de base"
                              value={registerForm.address}
                              onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                            />
                          </div>
                          
                          <Button type="submit" className="w-full" disabled={loading} variant="hero">
                            {loading ? 'Inscription en cours...' : 'Créer un compte Livreur'}
                          </Button>
                        </form>
                      </TabsContent>
                      
                      {/* Transitaire Registration */}
                      <TabsContent value="transitaire">
                        <div className="p-4 bg-purple-50 rounded-lg mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Globe className="w-5 h-5 text-purple-600" />
                            <h4 className="font-semibold text-purple-800">Compte Transitaire</h4>
                          </div>
                          <p className="text-sm text-purple-600">Gérez la logistique internationale</p>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); setRegisterForm({...registerForm, role: 'transitaire'}); handleRegister(e); }} className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="transitaire-name">Nom complet</Label>
                              <Input
                                id="transitaire-name"
                                placeholder="Votre nom"
                                value={registerForm.fullName}
                                onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="transitaire-company">Entreprise</Label>
                              <Input
                                id="transitaire-company"
                                placeholder="Nom de l'entreprise"
                                value={registerForm.businessName}
                                onChange={(e) => setRegisterForm({ ...registerForm, businessName: e.target.value })}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="transitaire-registration">Numéro d'enregistrement</Label>
                            <Input
                              id="transitaire-registration"
                              placeholder="Numéro d'enregistrement commercial"
                              value={registerForm.companyRegistration}
                              onChange={(e) => setRegisterForm({ ...registerForm, companyRegistration: e.target.value })}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="transitaire-phone">Téléphone</Label>
                            <div className="flex">
                              <Select
                                value={registerForm.phoneDialCode}
                                onValueChange={(value) => {
                                  const country = COUNTRIES.find(c => c.dialCode === value);
                                  setRegisterForm({
                                    ...registerForm,
                                    phoneDialCode: value,
                                    country: country?.code || 'GN'
                                  });
                                }}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {POPULAR_COUNTRIES.map((countryCode) => {
                                    const country = COUNTRIES.find(c => c.code === countryCode);
                                    return country ? (
                                      <SelectItem key={country.code} value={country.dialCode}>
                                        <span className="flex items-center">
                                          <span className="mr-2">{country.flag}</span>
                                          {country.dialCode}
                                        </span>
                                      </SelectItem>
                                    ) : null;
                                  })}
                                </SelectContent>
                              </Select>
                              <Input
                                id="transitaire-phone"
                                type="tel"
                                placeholder="123456789"
                                className="flex-1 ml-2"
                                value={registerForm.phone}
                                onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="transitaire-email">Email</Label>
                              <Input
                                id="transitaire-email"
                                type="email"
                                placeholder="votre@email.com"
                                value={registerForm.email}
                                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="transitaire-password">Mot de passe</Label>
                              <div className="relative">
                                <Input
                                  id="transitaire-password"
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  className="pr-10"
                                  value={registerForm.password}
                                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                  required
                                  minLength={6}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="transitaire-country">Pays</Label>
                            <Select
                              value={registerForm.country}
                              onValueChange={handleCountryChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez votre pays" />
                              </SelectTrigger>
                              <SelectContent>
                                {COUNTRIES.map((country) => (
                                  <SelectItem key={country.code} value={country.code}>
                                    <span className="flex items-center">
                                      <span className="mr-2">{country.flag}</span>
                                      {country.name}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="transitaire-address">Adresse</Label>
                            <Input
                              id="transitaire-address"
                              placeholder="Adresse de l'entreprise"
                              value={registerForm.address}
                              onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                            />
                          </div>
                          
                          <Button type="submit" className="w-full" disabled={loading} variant="hero">
                            {loading ? 'Inscription en cours...' : 'Créer un compte Transitaire'}
                          </Button>
                        </form>
                      </TabsContent>
                    </Tabs>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleAuth;