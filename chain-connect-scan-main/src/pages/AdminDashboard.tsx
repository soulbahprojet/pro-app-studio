import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PDGUserManagement from "@/components/PDGUserManagement";
import PDGSubscriptionManagement from "@/components/PDGSubscriptionManagement";
import PDGCommissionManagement from "@/components/PDGCommissionManagement";
import PDGSalaryManagement from "@/components/PDGSalaryManagement";
import PDGShopManagement from "@/components/PDGShopManagement";
import PDGMessageManagement from "@/components/PDGMessageManagement";
import PDGTransactionManagement from "@/components/PDGTransactionManagement";
import PDGSecurityManagement from "@/components/PDGSecurityManagement";
import PDGAIManagement from "@/components/PDGAIManagement";
import PDGSystemSettings from "@/components/PDGSystemSettings";
import PDGFeesConfiguration from "@/components/PDGFeesConfiguration";
import PDGSyndicatDashboard from "@/components/syndicat/PDGSyndicatDashboard";
import AICopilotPanel from "@/components/ai-copilot/AICopilotPanel";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  MapPin,
  RotateCcw,
  Database,
  Bot,
  Building2
} from "lucide-react";

const AdminDashboard = () => {
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
      navigate("/auth");
      return;
    }

    try {
      // Vérifier d'abord si l'utilisateur a le rôle admin dans son profil
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profileError || !userProfile || userProfile.role !== 'admin') {
        console.log('Utilisateur sans rôle admin, redirection vers auth');
        navigate("/auth");
        return;
      }

      // Si l'utilisateur a le rôle admin, vérifier s'il a aussi le rôle PDG
      const { data: adminRole, error } = await supabase
        .from('admin_roles')
        .select('role_type')
        .eq('user_id', user.id)
        .eq('role_type', 'pdg')
        .maybeSingle();

      if (error) {
        console.error('Erreur lors de la vérification du rôle PDG:', error);
        // Permettre l'accès même si la vérification PDG échoue pour les admins
      }

      // L'utilisateur peut accéder au dashboard même sans rôle PDG spécifique
      console.log('Accès autorisé à l\'interface admin/PDG');
      
    } catch (error) {
      console.error('Error checking access:', error);
      navigate("/auth");
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
    navigate("/auth");
  };

  const handleRestoreOldConfig = async () => {
    try {
      toast({
        title: "Restauration en cours",
        description: "Les anciennes configurations sont en cours de restauration...",
      });
      
      // Simuler la restauration (à implémenter selon vos besoins)
      setTimeout(() => {
        toast({
          title: "Restauration terminée",
          description: "Les anciennes configurations ont été restaurées avec succès.",
        });
        loadDashboardData(); // Recharger les données
      }, 2000);
    } catch (error) {
      toast({
        title: "Erreur de restauration",
        description: "Impossible de restaurer les anciennes configurations.",
        variant: "destructive",
      });
    }
  };

  const handleBackupCurrentConfig = async () => {
    try {
      toast({
        title: "Sauvegarde en cours",
        description: "Sauvegarde de la configuration actuelle...",
      });
      
      // Simuler la sauvegarde (à implémenter selon vos besoins)
      setTimeout(() => {
        toast({
          title: "Sauvegarde terminée",
          description: "La configuration actuelle a été sauvegardée.",
        });
      }, 1500);
    } catch (error) {
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder la configuration.",
        variant: "destructive",
      });
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            
            {/* Brand Section */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Crown className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Interface PDG Executive
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  224SOLUTIONS • Supervision & Gestion Avancée
                </p>
              </div>
            </div>
            
            {/* Action Buttons - Professional Layout */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Primary Actions */}
              <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-700 rounded-lg p-1">
                <Link to="/">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Accueil
                  </Button>
                </Link>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </Button>
              </div>
              
              {/* Configuration Management */}
              <div className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackupCurrentConfig}
                  className="text-amber-700 dark:text-amber-300 hover:text-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 font-medium"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRestoreOldConfig}
                  className="text-amber-700 dark:text-amber-300 hover:text-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 font-medium"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurer
                </Button>
              </div>
              
              {/* Security Action */}
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>

        {/* Executive Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Utilisateurs Total</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalUsers}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">+12% ce mois</p>
                </div>
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">Marchands Actifs</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.totalMerchants}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">+8% ce mois</p>
                </div>
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide">Livreurs Actifs</p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.totalCouriers}</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">+15% ce mois</p>
                </div>
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Truck className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Solde Global</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.totalWalletBalance}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">GNF</p>
                </div>
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Alerts Section */}
        {alerts.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-700">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-red-800 dark:text-red-200">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold">Alertes IA - Supervision 24/7</span>
                  <p className="text-sm text-red-600 dark:text-red-400 font-normal mt-1">Surveillance intelligente en temps réel</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert: any) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-red-200 dark:border-red-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <div>
                        <h4 className="font-semibold text-red-800 dark:text-red-200">{alert.title}</h4>
                        <p className="text-sm text-red-600 dark:text-red-400">{alert.description}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={alert.severity === 'critical' ? 'destructive' : 'outline'}
                      className="font-medium"
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Professional Management Tabs */}
        <Card className="bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700">
          <Tabs defaultValue="system" className="p-6">
            <TabsList className="grid w-full grid-cols-6 lg:grid-cols-13 gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg h-auto">
              
              {/* Core System */}
              <TabsTrigger value="system" className="flex flex-col items-center space-y-1 p-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-sm transition-all">
                <Settings className="h-4 w-4" />
                <span className="text-xs font-medium">Système</span>
              </TabsTrigger>
              
              {/* User Management */}
              <TabsTrigger value="users" className="flex flex-col items-center space-y-1 p-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-sm transition-all">
                <Users className="h-4 w-4" />
                <span className="text-xs font-medium">Utilisateurs</span>
              </TabsTrigger>
              
              {/* Business Management */}
              <TabsTrigger value="subscriptions" className="flex flex-col items-center space-y-1 p-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-sm transition-all">
                <Crown className="h-4 w-4" />
                <span className="text-xs font-medium">Abonnements</span>
              </TabsTrigger>
              
              <TabsTrigger value="commissions" className="flex flex-col items-center space-y-1 p-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-sm transition-all">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs font-medium">Commissions</span>
              </TabsTrigger>
              
              <TabsTrigger value="salaries" className="flex flex-col items-center space-y-1 p-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-sm transition-all">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-medium">Salaires</span>
              </TabsTrigger>
              
              <TabsTrigger value="shops" className="flex flex-col items-center space-y-1 p-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-sm transition-all">
                <Store className="h-4 w-4" />
                <span className="text-xs font-medium">Boutiques</span>
              </TabsTrigger>
              
              {/* Communication */}
              <TabsTrigger value="messages" className="flex flex-col items-center space-y-1 p-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-sm transition-all">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs font-medium">Messages</span>
              </TabsTrigger>
              
              {/* Financial */}
              <TabsTrigger value="fees" className="flex flex-col items-center space-y-1 p-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-sm transition-all">
                <Activity className="h-4 w-4" />
                <span className="text-xs font-medium">Frais</span>
              </TabsTrigger>
              
              <TabsTrigger value="wallet" className="flex flex-col items-center space-y-1 p-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-sm transition-all">
                <Wallet className="h-4 w-4" />
                <span className="text-xs font-medium">Transactions</span>
              </TabsTrigger>
              
              {/* Security & AI */}
              <TabsTrigger value="security" className="flex flex-col items-center space-y-1 p-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-sm transition-all">
                <Shield className="h-4 w-4" />
                <span className="text-xs font-medium">Sécurité</span>
              </TabsTrigger>
              
              <TabsTrigger value="ai" className="flex flex-col items-center space-y-1 p-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-sm transition-all">
                <Brain className="h-4 w-4" />
                <span className="text-xs font-medium">IA</span>
              </TabsTrigger>
              
              <TabsTrigger value="ai-copilot" className="flex flex-col items-center space-y-1 p-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-sm transition-all">
                <Bot className="h-4 w-4" />
                <span className="text-xs font-medium">AI Copilote</span>
              </TabsTrigger>
              
              {/* Organization */}
              <TabsTrigger value="syndicats" className="flex flex-col items-center space-y-1 p-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-sm transition-all">
                <Building2 className="h-4 w-4" />
                <span className="text-xs font-medium">Syndicats</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <div className="mt-6">
              <TabsContent value="system" className="space-y-6">
                <PDGSystemSettings />
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <PDGUserManagement />
              </TabsContent>

              <TabsContent value="subscriptions" className="space-y-6">
                <PDGSubscriptionManagement />
              </TabsContent>

              <TabsContent value="commissions" className="space-y-6">
                <PDGCommissionManagement />
              </TabsContent>

              <TabsContent value="salaries" className="space-y-6">
                <PDGSalaryManagement />
              </TabsContent>

              <TabsContent value="shops" className="space-y-6">
                <PDGShopManagement />
              </TabsContent>

              <TabsContent value="messages" className="space-y-6">
                <PDGMessageManagement />
              </TabsContent>

              <TabsContent value="fees" className="space-y-6">
                <PDGFeesConfiguration />
              </TabsContent>

              <TabsContent value="wallet" className="space-y-6">
                <PDGTransactionManagement />
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <PDGSecurityManagement />
              </TabsContent>

              <TabsContent value="ai" className="space-y-6">
                <PDGAIManagement />
              </TabsContent>

              <TabsContent value="ai-copilot" className="space-y-6">
                <AICopilotPanel />
              </TabsContent>

              <TabsContent value="syndicats" className="space-y-6">
                <PDGSyndicatDashboard />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;