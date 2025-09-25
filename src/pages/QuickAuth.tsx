import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Shield, UserPlus } from "lucide-react";

const QuickAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();

  const handleQuickRegister = async () => {
    setIsLoading(true);
    try {
      console.log('Quick registration attempt...');

      // Étape 1: Créer l'utilisateur directement avec une session
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'admin',
            email_verified: true
          }
        }
      });

      if (error) {
        console.error('Quick registration error:', error);
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        console.log('User created:', data.user.id);

        // Étape 2: Forcer la vérification de l'email
        try {
          await supabase.rpc('make_user_pdg', { user_email: email });
        } catch (rpcError) {
          console.log('RPC error (might be normal):', rpcError);
        }

        // Étape 3: Créer le profil et rôle manuellement
        const profileData = {
          user_id: data.user.id,
          email: email,
          full_name: fullName,
          role: 'admin' as const,
          is_verified: true
        };

        await supabase.from('profiles').insert(profileData);
        
        const adminRoleData = {
          user_id: data.user.id,
          role_type: 'pdg',
          permissions: { full_access: true }
        };

        await supabase.from('admin_roles').insert(adminRoleData);

        toast({
          title: "✅ Compte créé !",
          description: "Vous pouvez maintenant vous connecter.",
        });

        setMode('login');
      }
    } catch (error: any) {
      console.error('Quick registration catch error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création du compte.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setIsLoading(true);
    try {
      console.log('Quick login attempt...');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Quick login error:', error);
        
        if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Email non confirmé",
            description: "Essayez de créer un nouveau compte.",
            variant: "destructive",
          });
          setMode('register');
        } else {
          toast({
            title: "Erreur de connexion",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      if (data.user) {
        console.log('Quick login successful:', data.user.id);
        
        // Vérifier le rôle PDG
        const { data: adminRole } = await supabase
          .from('admin_roles')
          .select('role_type')
          .eq('user_id', data.user.id)
          .eq('role_type', 'pdg')
          .single();

        if (adminRole) {
          toast({
            title: "Connexion réussie",
            description: "Bienvenue dans l'interface PDG.",
          });
          navigate("/pdg-dashboard");
        } else {
          toast({
            title: "Connexion réussie",
            description: "Bienvenue dans l'interface admin.",
          });
          navigate("/admin-dashboard");
        }
      }
    } catch (error: any) {
      console.error('Quick login catch error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la connexion.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      await handleQuickLogin();
    } else {
      await handleQuickRegister();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {mode === 'login' ? 'Connexion' : 'Inscription'} Rapide
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Accès administrateur 224SOLUTIONS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Nom complet
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Votre nom complet"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@224solutions.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {mode === 'login' ? 'Connexion...' : 'Création...'}
                </div>
              ) : (
                <div className="flex items-center">
                  {mode === 'login' ? (
                    <Shield className="h-4 w-4 mr-2" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  {mode === 'login' ? 'Se connecter' : 'Créer un compte'}
                </div>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              disabled={isLoading}
              className="text-sm"
            >
              {mode === 'login' 
                ? "Pas de compte ? Créer un compte" 
                : "Déjà un compte ? Se connecter"}
            </Button>
          </div>

          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-sm"
            >
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickAuth;
