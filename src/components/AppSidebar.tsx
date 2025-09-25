import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import {
  Home,
  Package,
  ShoppingCart,
  Wallet,
  Users,
  Truck,
  BarChart3,
  Settings,
  FileText,
  QrCode,
  Globe,
  UserPlus,
  Shield,
  Database,
  HelpCircle,
  LogOut,
  CreditCard
} from "lucide-react";

const publicItems = [
  { title: "Accueil", url: "/", icon: Home },
  { title: "Marketplace", url: "/marketplace", icon: ShoppingCart },
  { title: "Authentification", url: "/auth", icon: Shield },
];

const clientItems = [
  { title: "Portefeuille", url: "/wallet", icon: Wallet },
  { title: "Cartes Virtuelles", url: "/virtual-cards", icon: CreditCard },
];

const sellerItems = [
  { title: "Dashboard Marchand", url: "/seller-dashboard", icon: BarChart3 },
  { title: "Boutique Digitale", url: "/digital-store", icon: Package },
  { title: "Boutique Pro", url: "/digital-store-pro", icon: Package },
  { title: "Gestion Produits", url: "/seller-dashboard#products", icon: Package },
  { title: "Commandes", url: "/seller-dashboard#orders", icon: FileText },
  { title: "Clients", url: "/seller-dashboard#customers", icon: Users },
  { title: "Statistiques", url: "/seller-dashboard#stats", icon: BarChart3 },
];

const courierItems = [
  { title: "Suivi Livraisons", url: "/tracking", icon: Truck },
  { title: "QR Scanner", url: "/tracking#scanner", icon: QrCode },
];

const adminItems = [
  { title: "Admin Dashboard", url: "/admin", icon: Database },
  { title: "Gestion Utilisateurs", url: "/admin#users", icon: UserPlus },
  { title: "Modération", url: "/admin#moderation", icon: Shield },
  { title: "Système", url: "/admin#system", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { profile, logout } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + "#");
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50";

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"}>
      <SidebarContent className="bg-background border-r">
        {/* Public Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-semibold">
            🌍 Navigation Publique
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {publicItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-3 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Client Features - SEULEMENT pour les clients */}
        {profile?.role === 'client' && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-blue-600 font-semibold">
              👤 Fonctionnalités Client
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {clientItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="mr-3 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Seller Features */}
        {profile?.role === 'seller' && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-green-600 font-semibold">
              🛍️ Fonctionnalités Marchand
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sellerItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="mr-3 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Courier Features */}
        {(profile?.role === 'courier' || profile?.role === 'transitaire') && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-orange-600 font-semibold">
              🚚 Fonctionnalités Livraison
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {courierItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="mr-3 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Admin Features */}
        {profile?.role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-red-600 font-semibold">
              ⚙️ Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="mr-3 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* User Actions */}
        {profile && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-600 font-semibold">
              👤 Compte
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Settings className="mr-3 h-4 w-4" />
                    {!collapsed && <span>Paramètres</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <HelpCircle className="mr-3 h-4 w-4" />
                    {!collapsed && <span>Aide</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleLogout}>
                    <LogOut className="mr-3 h-4 w-4" />
                    {!collapsed && <span>Déconnexion</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* User Info */}
        {profile && !collapsed && (
          <div className="p-4 border-t mt-auto">
            <div className="text-sm">
              <p className="font-medium">{profile.full_name}</p>
              <p className="text-muted-foreground">{profile.email}</p>
              <p className="text-xs text-primary font-medium capitalize">
                Rôle: {profile.role}
              </p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
