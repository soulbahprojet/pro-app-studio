import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Header from "
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        ";
import ClientNavigation from "
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        ";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { 
  Store, Package, ShoppingCart, BarChart3, Wallet, Settings, Users, MessageCircle,
  TrendingUp, TrendingDown, Eye, AlertTriangle, CheckCircle, Clock, 
  DollarSign, ArrowRight, Plus, Download, Upload, Edit, Trash2, Search,
  Filter, Bell, Shield, CreditCard, FileText, Globe, Smartphone, Zap
} from "lucide-react";
import VendorDashboardKPI from "../vendor/VendorDashboardKPI";
import VendorProductManager from "../vendor/VendorProductManager";
import VendorOrderManager from "../vendor/VendorOrderManager";
import VendorFinanceManager from "../vendor/VendorFinanceManager";
import VendorAnalytics from "../vendor/VendorAnalytics";
import VendorShopSettings from "../vendor/VendorShopSettings";

const VendorProfileDashboard = () => {
  const { profile, user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications, setNotifications] = useState(3);

  // Vérification de sécurité - Seuls les vendeurs peuvent accéder
  useEffect(() => {
    if (profile && profile.role !== 'seller') {
      toast.error("Accès refusé - Interface réservée aux vendeurs");
      navigate("/");
      return;
    }
  }, [profile, navigate]);

  // Ne pas afficher l'interface si l'utilisateur n'est pas vendeur
  if (!profile || profile.role !== 'seller') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        {/* Header vendeur avec profil et notifications */}
        <Card className="rounded-none border-0 border-b">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-14 w-14 border-2 border-primary">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                    {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'V'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-bold text-xl text-foreground">
                    {profile?.full_name || user?.email}
                  </h2>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Store className="h-4 w-4 mr-1" />
                    Vendeur Certifié • ID: {profile?.readable_id || 'N/A'}
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    <Shield className="h-3 w-3 mr-1" />
                    KYC Vérifié
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="relative"
                  onClick={() => toast.info("Notifications à venir")}
                >
                  <Bell className="h-4 w-4" />
                  {notifications > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                      {notifications}
                    </Badge>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={logout}
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  Déconnexion
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation par onglets */}
        <div className="border-b bg-background sticky top-20 z-10">
          <div className="px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="dashboard" 
                  className="flex items-center space-x-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="produits" 
                  className="flex items-center space-x-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  <Package className="h-4 w-4" />
                  <span>Catalogue</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="commandes" 
                  className="flex items-center space-x-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Commandes</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="finances" 
                  className="flex items-center space-x-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  <Wallet className="h-4 w-4" />
                  <span>Finances</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="flex items-center space-x-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Analytics</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="boutique" 
                  className="flex items-center space-x-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  <Settings className="h-4 w-4" />
                  <span>Boutique</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="dashboard" className="mt-0">
              <VendorDashboardKPI />
            </TabsContent>
            
            <TabsContent value="produits" className="mt-0">
              <VendorProductManager />
            </TabsContent>
            
            <TabsContent value="commandes" className="mt-0">
              <VendorOrderManager />
            </TabsContent>
            
            <TabsContent value="finances" className="mt-0">
              <VendorFinanceManager />
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-0">
              <VendorAnalytics />
            </TabsContent>
            
            <TabsContent value="boutique" className="mt-0">
              <VendorShopSettings />
            </TabsContent>
          </Tabs>
        </div>

        <ClientNavigation />
        
        {/* Espacement pour la navigation */}
        <div className="h-20" />
      </div>
    </div>
  );
};

export default VendorProfileDashboard;
