import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PDGUserManagement from "
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        ";
import PDGSubscriptionManagement from "
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        ";
import PDGCommissionManagement from "
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        ";
import PDGSalaryManagement from "
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        ";
import PDGShopManagement from "
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        ";
import PDGMessageManagement from "
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        ";
import PDGTransactionManagement from "
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        ";
import PDGSecurityManagement from "
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        ";
import PDGAIManagement from "
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        ";
import PDGSystemSettings from "
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        ";
import PDGFeesConfiguration from "
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        ";
import PDGTaxiMotoManagement from "
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        ";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Users, 
  ShoppingBag, 
  Truck, 
  Wallet, 
  TrendingUp, 
  Crown, 
  AlertTriangle,
  Settings,
  LogOut,
  Shield,
  DollarSign,
  UserCheck,
  Store,
  MessageSquare,
  FileText,
  Bell,
  Brain,
  Activity,
  Car
} from "lucide-react";

const PDGDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMerchants: 0,
    totalCouriers: 0,
    totalWalletBalance: 0,
    totalRevenue: 0,
    activeSubscriptions: 0
  });
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    checkAccess();
    loadDashboardData();
  }, [user]);

  const checkAccess = async () => {
    if (!user) {
      navigate("/pdg-login");
      return;
    }

    try {
      const { data: adminRole, error } = await supabase
        .from('admin_roles')
        .select('role_type')
        .eq('user_id', user.id)
        .eq('role_type', 'pdg')
        .maybeSingle();

      if (error || !adminRole) {
        // Redirection silencieuse sans toast d'erreur
        navigate("/pdg-login");
        return;
      }
    } catch (error) {
      console.error('Error checking access:', error);
      navigate("/pdg-login");
    }
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les statistiques des utilisateurs
      const { data: profiles } = await supabase
        .from('profiles')
        .select('role');
      
      const totalUsers = profiles?.length || 0;
      const totalMerchants = profiles?.filter(p => p.role === 'seller')?.length || 0;
      const totalCouriers = profiles?.filter(p => p.role === 'courier')?.length || 0;

      // Simuler les alertes IA (à remplacer par la vraie table une fois disponible)
      const aiAlerts = [
        {
          id: '1',
          title: 'Tentative de connexion suspecte',
          description: 'Plusieurs tentatives de connexion échouées détectées',
          severity: 'high'
        }
      ];

      setStats({
        totalUsers,
        totalMerchants,
        totalCouriers,
        totalWalletBalance: 0, // À calculer depuis la table wallets
        totalRevenue: 0, // À calculer depuis les transactions
        activeSubscriptions: 0 // À calculer depuis pdg_subscriptions
      });

      setAlerts(aiAlerts || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du dashboard.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/pdg-login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg">Chargement du dashboard PDG...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Interface PDG - 224SOLUTIONS</h1>
              <p className="text-muted-foreground">Supervision et gestion complète</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Dashboard Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Utilisateurs Total</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Marchands</p>
                  <p className="text-2xl font-bold">{stats.totalMerchants}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Livreurs</p>
                  <p className="text-2xl font-bold">{stats.totalCouriers}</p>
                </div>
                <Truck className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Solde Total</p>
                  <p className="text-2xl font-bold">{stats.totalWalletBalance} GNF</p>
                </div>
                <Wallet className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertes IA */}
        {alerts.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                Alertes IA - Supervision 24/7
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert: any) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <h4 className="font-medium text-red-800">{alert.title}</h4>
                      <p className="text-sm text-red-600">{alert.description}</p>
                    </div>
                    <Badge variant={alert.severity === 'critical' ? 'destructive' : 'outline'}>
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs de gestion */}
        <Tabs defaultValue="system" className="space-y-4">
          <TabsList className="grid w-full grid-cols-12">
            <TabsTrigger value="system" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Système</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Utilisateurs</span>
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center space-x-2">
              <Crown className="h-4 w-4" />
              <span>Abonnements</span>
            </TabsTrigger>
            <TabsTrigger value="commissions" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Commissions</span>
            </TabsTrigger>
            <TabsTrigger value="salaries" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Salaires</span>
            </TabsTrigger>
            <TabsTrigger value="shops" className="flex items-center space-x-2">
              <Store className="h-4 w-4" />
              <span>Boutiques</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Messages</span>
            </TabsTrigger>
            <TabsTrigger value="fees" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Frais</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center space-x-2">
              <Wallet className="h-4 w-4" />
              <span>Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Sécurité</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>IA</span>
            </TabsTrigger>
            <TabsTrigger value="taxi-moto" className="flex items-center space-x-2">
              <Car className="h-4 w-4" />
              <span>Taxi-Moto</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system">
            <PDGSystemSettings />
          </TabsContent>

          <TabsContent value="users">
            <PDGUserManagement />
          </TabsContent>

          <TabsContent value="subscriptions">
            <PDGSubscriptionManagement />
          </TabsContent>

          <TabsContent value="commissions">
            <PDGCommissionManagement />
          </TabsContent>

          <TabsContent value="salaries">
            <PDGSalaryManagement />
          </TabsContent>

          <TabsContent value="shops">
            <PDGShopManagement />
          </TabsContent>

          <TabsContent value="messages">
            <PDGMessageManagement />
          </TabsContent>

          <TabsContent value="fees">
            <PDGFeesConfiguration />
          </TabsContent>

          <TabsContent value="wallet">
            <PDGTransactionManagement />
          </TabsContent>

          <TabsContent value="security">
            <PDGSecurityManagement />
          </TabsContent>

          <TabsContent value="ai">
            <PDGAIManagement />
          </TabsContent>

          <TabsContent value="taxi-moto">
            <PDGTaxiMotoManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PDGDashboard;
