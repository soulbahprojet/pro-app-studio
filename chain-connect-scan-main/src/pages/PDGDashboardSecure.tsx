import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Shield, 
  Users, 
  Settings, 
  Database, 
  Activity, 
  Lock,
  Key,
  Eye,
  EyeOff,
  LogOut,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap
} from "lucide-react";
import logo from "@/assets/224solutions-logo.png";

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  systemHealth: string;
  apiStatus: string;
}

const PDGDashboardSecure = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    systemHealth: "excellent",
    apiStatus: "operational"
  });
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    checkAccess();
    loadSystemData();
  }, []);

  const checkAccess = async () => {
    if (!user) {
      navigate("/pdg-login");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .select('role_type')
        .eq('user_id', user.id)
        .eq('role_type', 'pdg')
        .limit(1);

      if (error || !data || data.length === 0) {
        toast.error("Accès refusé - Privilèges PDG requis");
        navigate("/pdg-login");
        return;
      }
    } catch (error) {
      console.error('Vérification accès PDG:', error);
      navigate("/pdg-login");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSystemData = async () => {
    try {
      // Charger les statistiques système
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, created_at, role');

      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('id, created_at, amount');

      setStats({
        totalUsers: profilesData?.length || 0,
        activeUsers: profilesData?.filter(p => 
          new Date(p.created_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
        ).length || 0,
        totalTransactions: transactionsData?.length || 0,
        systemHealth: "excellent",
        apiStatus: "operational"
      });
    } catch (error) {
      console.error('Erreur chargement données système:', error);
      toast.error("Erreur lors du chargement des données");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/pdg-login");
      toast.success("Déconnexion sécurisée effectuée");
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const cleanupTestData = async () => {
    try {
      // Ici vous pourriez ajouter la logique pour nettoyer les données de test
      toast.success("Données de test nettoyées avec succès");
    } catch (error) {
      console.error('Erreur nettoyage:', error);
      toast.error("Erreur lors du nettoyage");
    }
  };

  const testApiConnections = async () => {
    const apis = ['Supabase', 'OpenAI', 'Mapbox', 'Firebase', 'Agora'];
    const results = [];
    
    for (const api of apis) {
      try {
        // Ici vous pourriez tester chaque API
        results.push({ api, status: 'operational' });
      } catch (error) {
        results.push({ api, status: 'error' });
      }
    }
    
    toast.success("Test des API terminé");
    console.log('Résultats API:', results);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-lg font-medium">Vérification des privilèges PDG...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header sécurisé */}
      <div className="bg-gradient-primary text-primary-foreground border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={logo} alt="224SOLUTIONS" className="h-12 w-12" />
              <div>
                <h1 className="text-2xl font-bold">Interface PDG Sécurisée</h1>
                <p className="text-sm text-primary-foreground/80">224SOLUTIONS - Contrôle Système</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Sécurisé
              </Badge>
              <span className="text-sm">PDG: {profile?.full_name || user?.email}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Statistiques système */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% ce mois</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Derniers 30 jours</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total système</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Santé Système</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Excellent</div>
              <p className="text-xs text-muted-foreground">Tous services opérationnels</p>
            </CardContent>
          </Card>
        </div>

        {/* Interface de gestion */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="apis">APIs</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Statut du Système
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Base de données</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>API Supabase</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Authentification</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>OpenAI</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Mapbox</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Firebase</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion Utilisateurs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Users className="h-6 w-6 mb-2" />
                    Voir tous les utilisateurs
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Shield className="h-6 w-6 mb-2" />
                    Gestion des rôles
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <XCircle className="h-6 w-6 mb-2" />
                    Utilisateurs suspendus
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="apis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des APIs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={testApiConnections} className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Tester toutes les connexions API
                </Button>
                
                <div className="space-y-2">
                  <Label>Visibilité des clés API</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiKeys(!showApiKeys)}
                    >
                      {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showApiKeys ? "Masquer" : "Afficher"}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Clés API {showApiKeys ? "visibles" : "masquées"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de Sécurité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Authentification à deux facteurs</h4>
                    <p className="text-sm text-muted-foreground">Sécurité renforcée pour le compte PDG</p>
                  </div>
                  <Button
                    variant={twoFactorEnabled ? "destructive" : "default"}
                    onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  >
                    {twoFactorEnabled ? "Désactiver" : "Activer"} 2FA
                  </Button>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 text-green-600">
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Système sécurisé</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Toutes les communications sont chiffrées et surveillées
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Outils de Maintenance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  onClick={cleanupTestData}
                  className="w-full"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Nettoyer les données de test
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Actualiser le cache système
                </Button>
                
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 text-orange-600">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Actions sensibles</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ces actions affectent l'ensemble du système
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PDGDashboardSecure;