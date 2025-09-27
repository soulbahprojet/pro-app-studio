import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  TrendingUp, 
  ShoppingCart,
  Eye,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Euro,
  Star,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockProducts: number;
  avgRating: number;
  monthlyGrowth: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  date: string;
  products: number;
}

export default function VendorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 24,
    totalOrders: 89,
    totalRevenue: 12450,
    totalCustomers: 156,
    pendingOrders: 7,
    lowStockProducts: 3,
    avgRating: 4.6,
    monthlyGrowth: 15.3
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([
    {
      id: 'CMD-001',
      customerName: 'Marie Dubois',
      amount: 299.99,
      status: 'pending',
      date: '2024-01-15',
      products: 2
    },
    {
      id: 'CMD-002', 
      customerName: 'Jean Martin',
      amount: 159.50,
      status: 'confirmed',
      date: '2024-01-15',
      products: 1
    },
    {
      id: 'CMD-003',
      customerName: 'Sophie Laurent',
      amount: 89.99,
      status: 'shipped',
      date: '2024-01-14',
      products: 3
    }
  ]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'outline' as const, icon: Clock, text: 'En attente' },
      confirmed: { variant: 'default' as const, icon: CheckCircle, text: 'Confirmé' },
      shipped: { variant: 'secondary' as const, icon: Package, text: 'Expédié' },
      delivered: { variant: 'default' as const, icon: CheckCircle, text: 'Livré' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon size={12} />
        <span>{config.text}</span>
      </Badge>
    );
  };

  const dashboardCards = [
    {
      title: "Produits",
      icon: <Package className="h-6 w-6" />,
      value: stats.totalProducts,
      description: `${stats.lowStockProducts} en rupture`,
      link: "/vendor/products",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "+2 ce mois"
    },
    {
      title: "Commandes",
      icon: <ShoppingCart className="h-6 w-6" />,
      value: stats.totalOrders,
      description: `${stats.pendingOrders} en attente`,
      link: "/vendor/orders",
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "+12 ce mois"
    },
    {
      title: "Chiffre d'affaires",
      icon: <Euro className="h-6 w-6" />,
      value: `${stats.totalRevenue.toLocaleString()}€`,
      description: "Ce mois",
      link: "/vendor/analytics",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: `+${stats.monthlyGrowth}%`
    },
    {
      title: "Clients",
      icon: <Users className="h-6 w-6" />,
      value: stats.totalCustomers,
      description: `Note: ${stats.avgRating}/5`,
      link: "/vendor/customers",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: "+23 ce mois"
    }
  ];

  const quickActions = [
    {
      title: "Ajouter un produit",
      description: "Créer un nouveau produit",
      icon: <Plus className="h-5 w-5" />,
      link: "/vendor/products/new",
      color: "bg-blue-600"
    },
    {
      title: "Voir les commandes",
      description: "Gérer les commandes en cours",
      icon: <Eye className="h-5 w-5" />,
      link: "/vendor/orders",
      color: "bg-green-600"
    },
    {
      title: "Statistiques",
      description: "Analyser les performances",
      icon: <BarChart3 className="h-5 w-5" />,
      link: "/vendor/analytics",
      color: "bg-purple-600"
    },
    {
      title: "Paramètres",
      description: "Configuration boutique",
      icon: <Settings className="h-5 w-5" />,
      link: "/vendor/settings",
      color: "bg-gray-600"
    }
  ];

  return (
    <div className="w-full space-y-8">
      {/* Header avec accueil personnalisé */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Dashboard Vendeur</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Gérez votre boutique, suivez vos performances et développez votre activité sur 224Solutions
        </p>
        <div className="flex justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-green-600" size={16} />
            <span className="text-green-600 font-medium">+{stats.monthlyGrowth}% ce mois</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="text-yellow-500" size={16} />
            <span>{stats.avgRating}/5 étoiles</span>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <Link to={card.link}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <div className={card.color}>{card.icon}</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">{card.value}</div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{card.description}</p>
                    <div className="flex items-center text-xs text-green-600">
                      <ArrowUpRight size={12} />
                      <span>{card.trend}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings size={20} />
            <span>Actions Rapides</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link}>
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm group-hover:text-primary">
                        {action.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertes et notifications */}
      {(stats.lowStockProducts > 0 || stats.pendingOrders > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stats.lowStockProducts > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-600">
                  <AlertCircle size={20} />
                  <span>Alertes Stock</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {stats.lowStockProducts} produit{stats.lowStockProducts > 1 ? 's' : ''} en rupture de stock
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/vendor/products?filter=low-stock">
                    Gérer le stock
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {stats.pendingOrders > 0 && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-600">
                  <Clock size={20} />
                  <span>Commandes en attente</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {stats.pendingOrders} commande{stats.pendingOrders > 1 ? 's' : ''} en attente de validation
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/vendor/orders?status=pending">
                    Traiter les commandes
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Commandes récentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart size={20} />
            <span>Commandes Récentes</span>
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/vendor/orders">
              Voir toutes les commandes
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{order.id}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.customerName} • {order.products} produit{order.products > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{order.amount.toFixed(2)}€</div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/vendor/orders/${order.id}`}>
                      Détails
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance mensuelle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 size={20} />
              <span>Performance ce Mois</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Ventes</span>
                <span className="font-medium">{stats.totalRevenue.toLocaleString()}€</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-600" style={{width: '75%'}}></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Commandes</span>
                <span className="font-medium">{stats.totalOrders}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{width: '60%'}}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Nouveaux clients</span>
                <span className="font-medium">23</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600" style={{width: '45%'}}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conseils pour Améliorer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm">Ajouter plus de photos produits</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm">Répondre rapidement aux clients</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <span className="text-sm">Optimiser vos descriptions</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Voir tous les conseils
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
