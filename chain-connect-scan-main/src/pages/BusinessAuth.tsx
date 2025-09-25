import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Shield, Store, Truck, Globe } from 'lucide-react';

const BusinessAuth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [businessType, setBusinessType] = useState<'seller' | 'courier' | 'transitaire'>('seller');
  
  // Login form
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const businessTypes = [
    {
      type: 'seller' as const,
      title: 'Marchand',
      icon: Store,
      description: 'Créer votre boutique et vendre vos produits',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      type: 'courier' as const,
      title: 'Livreur/Motard',
      icon: Truck,
      description: 'Livrer des colis et gagner des commissions',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      type: 'transitaire' as const,
      title: 'Transitaire International',
      icon: Globe,
      description: 'Gérer les expéditions internationales',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const success = await login(loginForm.email, loginForm.password);
      if (success) {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur votre espace professionnel !",
        });
        navigate('/');
      } else {
        toast({
          title: "Erreur de connexion",
          description: "Email ou mot de passe incorrect.",
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

  const selectedBusinessType = businessTypes.find(bt => bt.type === businessType);
  const Icon = selectedBusinessType?.icon || Store;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/50 to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`w-16 h-16 ${selectedBusinessType?.bgColor} rounded-xl flex items-center justify-center`}>
              <Icon className={`w-8 h-8 ${selectedBusinessType?.color}`} />
            </div>
          </div>
          <CardTitle className="text-2xl bg-gradient-hero bg-clip-text text-transparent">
            Espace Professionnel
          </CardTitle>
          <CardDescription>
            {selectedBusinessType?.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">S'inscrire</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email professionnel</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@entreprise.com"
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
            
            <TabsContent value="register">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Type d'activité</Label>
                  <div className="grid gap-2">
                    {businessTypes.map((bt) => {
                      const TypeIcon = bt.icon;
                      return (
                        <Button
                          key={bt.type}
                          variant={businessType === bt.type ? "default" : "outline"}
                          className="justify-start p-4 h-auto"
                          onClick={() => setBusinessType(bt.type)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 ${bt.bgColor} rounded-lg flex items-center justify-center`}>
                              <TypeIcon className={`w-5 h-5 ${bt.color}`} />
                            </div>
                            <div className="text-left">
                              <div className="font-medium">{bt.title}</div>
                              <div className="text-xs text-muted-foreground">{bt.description}</div>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate(`/auth/register?type=${businessType}`)}
                  className="w-full"
                  variant="hero"
                >
                  Créer mon compte {selectedBusinessType?.title.toLowerCase()}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Vous êtes un client ?{' '}
              <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth/client')}>
                Espace client
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessAuth;