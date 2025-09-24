import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  MessageSquare,
  Settings,
  Truck,
  CreditCard,
  BarChart3,
  Tag,
  FileText,
} from "lucide-react";

const sidebarItems = [
  {
    title: "Tableau de bord",
    href: "/vendor-dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Produits",
    href: "/vendor/products",
    icon: Package,
  },
  {
    title: "Commandes",
    href: "/vendor/orders",
    icon: ShoppingCart,
  },
  {
    title: "Clients",
    href: "/vendor/customers",
    icon: Users,
  },
  {
    title: "Stock",
    href: "/vendor/inventory",
    icon: Truck,
  },
  {
    title: "Ventes",
    href: "/vendor/sales",
    icon: TrendingUp,
  },
  {
    title: "Promotions",
    href: "/vendor/promotions",
    icon: Tag,
  },
  {
    title: "Paiements",
    href: "/vendor/payments",
    icon: CreditCard,
  },
  {
    title: "Messages",
    href: "/vendor/messages",
    icon: MessageSquare,
  },
  {
    title: "Rapports",
    href: "/vendor/reports",
    icon: BarChart3,
  },
  {
    title: "Factures",
    href: "/vendor/invoices",
    icon: FileText,
  },
  {
    title: "Paramètres",
    href: "/vendor/settings",
    icon: Settings,
  },
];

export const VendorSidebar = () => {
  const location = useLocation();

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-30">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Interface Vendeur</h2>
        <p className="text-sm text-muted-foreground">224Solutions</p>
      </div>

      <nav className="p-4 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};