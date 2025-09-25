import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

import { COUNTRIES, POPULAR_COUNTRIES, searchCountries } from '@/utils/countries';
import { Eye, EyeOff, User, Phone, Mail, MapPin, Shield, Store, Truck, Globe, ShoppingBag } from 'lucide-react';
import CourierRegistration from '@/components/auth/CourierRegistration';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, login } = useAuth();
  const { toast } = useToast();
  
  const userType = searchParams.get('type') as 'client' | 'seller' | 'courier' | 'transitaire' | 'admin' || 'client';
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  
  // Login form
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  
  // Register form
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    role: userType,
    password: '',
    confirmPassword: '',
    // Champs spécifiques selon le rôle
    businessName: '', // Pour marchands
    vehicleType: '', // Pour livreurs (moto/voiture)
    unionType: '', // Pour syndicats (syndicat_moto/syndicat_voiture)
    vehiclePlate: '', // Pour livreurs
    companyRegistration: '', // Pour transitaires
    gpsVerified: false, // Vérification GPS
    gpsCountry: '', // Pays détecté par GPS
  });

  const [currentStep, setCurrentStep] = useState(1);

  const rolesData = {
    client: { 
      label: 'Client', 
      icon: ShoppingBag, 
      description: 'Acheter et recevoir des produits',
      color: 'text-client-foreground',
      bgColor: 'bg-client',
      variant: 'client' as const
    },
    seller: { 
      label: 'Marchand', 
      icon: Store, 
      description: 'Vendre des produits et gérer une boutique',
      color: 'text-seller-foreground',
      bgColor: 'bg-seller',
      variant: 'seller' as const
    },
    courier: { 
      label: 'Livreur/Motard', 
      icon: Truck, 
      description: 'Livrer des colis et gagner des commissions',
      color: 'text-courier-foreground',
      bgColor: 'bg-courier',
      variant: 'courier' as const
    },
    transitaire: { 
      label: 'Transitaire International', 
      icon: Globe, 
      description: 'Gérer les expéditions internationales',
      color: 'text-transitaire-foreground',
      bgColor: 'bg-transitaire',
      variant: 'transitaire' as const
    },
  };

  const roles = [
    { value: 'client', ...rolesData.client },
    { value: 'seller', ...rolesData.seller },
    { value: 'courier', ...rolesData.courier },
    { value: 'transitaire', ...rolesData.transitaire },
  ];

  const vehicleTypes = [
    { value: 'motorbike', label: 'Moto' },
    { value: 'car', label: 'Voiture' },
    { value: 'truck', label: 'Camion' },
    { value: 'bicycle', label: 'Vélo' },
  ];

  // Filtrer les pays selon la recherche
  const filteredCountries = countrySearch 
    ? searchCountries(countrySearch)
    : [
        ...COUNTRIES.filter(c => POPULAR_COUNTRIES.includes(c.code)),
        ...COUNTRIES.filter(c => !POPULAR_COUNTRIES.includes(c.code))
      ];

  const currentRole = rolesData[userType] || rolesData.client;
  const Icon = currentRole.icon;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await login(loginForm.email, loginForm.password);
      if (!result.error) {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté !",
        });
        navigate('/');
      } else {
        toast({
          title: "Erreur de connexion",
          description: result.error || "Email ou mot de passe incorrect.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }
    
    if (registerForm.password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await register(registerForm.email, registerForm.password, {
        fullName: registerForm.name,
        phone: registerForm.phone,
        role: registerForm.role,
        country: registerForm.country,
        vehicleType: registerForm.vehicleType,
        unionType: registerForm.unionType,
        gpsVerified: registerForm.gpsVerified,
        gpsCountry: registerForm.gpsCountry,
      });
      if (!result.error) {
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès !",
        });
        navigate('/');
      } else {
        toast({
          title: "Erreur d'inscription",
          description: result.error || "Impossible de créer le compte.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-background via-background/50 to-primary/5 p-4">
      {/* Auth page container */}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">2</span>
            </div>
          </div>
          <CardTitle className="text-2xl bg-gradient-hero bg-clip-text text-transparent">
            224SOLUTIONS
          </CardTitle>
          <CardDescription>
            Votre plateforme de commerce et de livraison
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>
            
            {/* Onglet Connexion */}
            <TabsContent value="login">
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
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>
            </TabsContent>
            
            {/* Onglet Inscription */}
            <TabsContent value="register">
              {registerForm.role === 'courier' && currentStep === 2 ? (
                <CourierRegistration 
                  registerForm={registerForm}
                  setRegisterForm={setRegisterForm}
                  onNext={() => setCurrentStep(3)}
                />
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Étape 1: Informations de base */}
                  {currentStep === 1 && (
                    <>
                      {/* Sélection du Type de Compte */}
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Type de compte</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {roles.map((role) => {
                            const RoleIcon = role.icon;
                            return (
                              <Button
                                key={role.value}
                                type="button"
                                variant={registerForm.role === role.value ? role.variant : "outline"}
                                className="p-3 h-auto flex flex-col items-center space-y-1"
                                onClick={() => setRegisterForm({...registerForm, role: role.value as 'client' | 'seller' | 'courier' | 'transitaire' | 'admin'})}
                              >
                                <div className={`w-6 h-6 ${role.bgColor} rounded-md flex items-center justify-center`}>
                                  <RoleIcon className={`w-4 h-4 ${role.color}`} />
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-xs text-foreground">{role.label}</div>
                                </div>
                              </Button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          {rolesData[registerForm.role]?.description}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="name">Nom complet</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            id="name"
                            placeholder="Votre nom complet"
                            className="pl-10"
                            value={registerForm.name}
                            onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            id="reg-email"
                            type="email"
                            placeholder="votre@email.com"
                            className="pl-10"
                            value={registerForm.email}
                            onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+224 xxx xxx xxx"
                            className="pl-10"
                            value={registerForm.phone}
                            onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Pays</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
                          <Select value={registerForm.country} onValueChange={(value) => setRegisterForm({...registerForm, country: value})}>
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Sélectionnez votre pays" />
                            </SelectTrigger>
                            <SelectContent className="bg-background border border-border shadow-lg max-h-60 z-50">
                              <div className="sticky top-0 p-2 bg-background border-b">
                                <Input
                                  placeholder="Rechercher un pays..."
                                  value={countrySearch}
                                  onChange={(e) => setCountrySearch(e.target.value)}
                                  className="h-8"
                                />
                              </div>
                              {filteredCountries.map((country) => (
                                <SelectItem key={country.code} value={country.name}>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-lg">{country.flag}</span>
                                    <span>{country.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="reg-password">Mot de passe</Label>
                          <div className="relative">
                            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                              id="reg-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10"
                              value={registerForm.password}
                              onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirmer</Label>
                          <div className="relative">
                            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                              id="confirm-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10"
                              value={registerForm.confirmPassword}
                              onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          className="px-2"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {showPassword ? 'Masquer' : 'Afficher'} les mots de passe
                        </span>
                      </div>
                      
                      {registerForm.role === 'courier' ? (
                        <Button 
                          type="button" 
                          className="w-full" 
                          onClick={() => setCurrentStep(2)}
                          disabled={!registerForm.name || !registerForm.email || !registerForm.phone || !registerForm.country || !registerForm.password || !registerForm.confirmPassword}
                          variant="hero"
                        >
                          Continuer - Options livreur
                        </Button>
                      ) : (
                        <Button type="submit" className="w-full" disabled={loading} variant="hero">
                          {loading ? 'Inscription...' : `S'inscrire comme ${rolesData[registerForm.role]?.label}`}
                        </Button>
                      )}
                    </>
                  )}

                  {/* Étape 3: Finalisation pour livreurs */}
                  {currentStep === 3 && registerForm.role === 'courier' && (
                    <>
                      <div className="text-center space-y-2 mb-4">
                        <h3 className="text-lg font-semibold">Finaliser votre inscription</h3>
                        <p className="text-sm text-muted-foreground">
                          Vérifiez vos informations avant de créer votre compte
                        </p>
                      </div>

                      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Type de véhicule:</span>
                          <span className="text-sm">
                            {registerForm.vehicleType === 'moto' ? '🏍️ Moto' : '🚗 Voiture'}
                          </span>
                        </div>
                        {registerForm.unionType && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Bureau Syndicat:</span>
                            <span className="text-sm">
                              {registerForm.unionType === 'syndicat_moto' ? '🏍️ Syndicat Moto' : '🚗 Syndicat Voiture'}
                            </span>
                          </div>
                        )}
                        {registerForm.gpsVerified && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">GPS vérifié:</span>
                            <span className="text-sm text-green-600">✅ {registerForm.gpsCountry}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setCurrentStep(2)}
                          className="flex-1"
                        >
                          Retour
                        </Button>
                        <Button 
                          type="submit" 
                          className="flex-1" 
                          disabled={loading} 
                          variant="hero"
                        >
                          {loading ? 'Inscription...' : 'Créer mon compte'}
                        </Button>
                      </div>
                    </>
                  )}
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;