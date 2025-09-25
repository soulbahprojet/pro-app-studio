import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  ShoppingCart, 
  Package, 
  DollarSign,
  Users,
  BarChart3,
  Calendar,
  Award
} from 'lucide-react';

interface AnalyticsProps {
  stats: {
    summary: {
      totalProducts: number;
      totalOrders: number;
      totalRevenue: number;
      averageRating: number;
      totalReviews: number;
      conversionRate: string;
    };
    ordersByStatus: Record<string, number>;
    topProducts: Array<{
      name: string;
      category: string;
      quantity: number;
      revenue: number;
    }>;
    reviews: {
      average: number;
      total: number;
      distribution: Record<string, number>;
      recent: Array<{
        rating: number;
        comment: string;
        created_at: string;
        is_verified: boolean;
      }>;
    };
    revenue: {
      daily: Array<{
        date: string;
        revenue: number;
        orders: number;
      }>;
      monthly: Array<{
        month: string;
        revenue: number;
      }>;
    };
  } | null;
}

const AnalyticsDashboard: React.FC<AnalyticsProps> = ({ stats }) => {
  // Vérification de sécurité robuste pour éviter les erreurs null
  if (!stats || !stats.summary || !stats.reviews || !stats.revenue || !stats.ordersByStatus || !stats.topProducts) {
    return (
      <div className="space-y-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Chargement des analytics...</p>
              <p className="text-xs mt-2">Données en cours de traitement...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Valeurs par défaut pour éviter les erreurs
  const summary = {
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
    conversionRate: '0',
    ...stats.summary
  };

  const reviews = {
    average: 0,
    total: 0,
    distribution: {},
    recent: [],
    ...stats.reviews
  };

  const revenue = {
    daily: [],
    monthly: [],
    ...stats.revenue
  };

  const formatAmount = (amount: number) => {
    return `${amount.toLocaleString()} GNF`;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      shipped: 'bg-purple-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmé',
      shipped: 'Expédié',
      delivered: 'Livré',
      cancelled: 'Annulé'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-400 fill-current opacity-50' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Commandes</CardTitle>
            <ShoppingCart className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{summary.totalOrders}</div>
            <div className="flex items-center text-sm text-blue-700 mt-2">
              <TrendingUp className="w-4 h-4 mr-1" />
              Taux de conversion: {summary.conversionRate}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Revenus Totaux</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{formatAmount(summary.totalRevenue)}</div>
            <div className="text-sm text-green-700 mt-2">
              Revenu moyen par commande: {formatAmount(summary.totalRevenue / (summary.totalOrders || 1))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900">Note Moyenne</CardTitle>
            <Star className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-3xl font-bold text-yellow-900">{reviews.average.toFixed(1)}</div>
              <div className="flex">
                {renderStars(reviews.average)}
              </div>
            </div>
            <div className="text-sm text-yellow-700 mt-2">
              Basé sur {reviews.total} avis clients
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Produits Actifs</CardTitle>
            <Package className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{summary.totalProducts}</div>
            <div className="text-sm text-purple-700 mt-2">
              Catalogue complet disponible
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Revenus Journaliers (30 derniers jours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-1">
              {revenue.daily.length > 0 ? revenue.daily.map((day, index) => {
                const maxRevenue = Math.max(...revenue.daily.map(d => d.revenue));
                const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div 
                      className="w-full bg-primary rounded-t transition-all duration-200 hover:bg-primary/80 min-h-[4px]"
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`${new Date(day.date).toLocaleDateString('fr-FR')}: ${formatAmount(day.revenue)} (${day.orders} commandes)`}
                    />
                    <div className="text-xs text-muted-foreground mt-1 transform rotate-45 origin-left opacity-0 group-hover:opacity-100 transition-opacity">
                      {new Date(day.date).getDate()}
                    </div>
                  </div>
                );
              }) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune donnée disponible</p>
                  </div>
                </div>
              )}
            </div>
            {revenue.daily.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Meilleur jour:</span>
                  <div className="font-semibold">
                    {formatAmount(Math.max(...revenue.daily.map(d => d.revenue)))}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Moyenne journalière:</span>
                  <div className="font-semibold">
                    {formatAmount(revenue.daily.reduce((sum, d) => sum + d.revenue, 0) / revenue.daily.length)}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Répartition des Commandes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.ordersByStatus || {}).map(([status, count]) => {
                const percentage = summary.totalOrders > 0 ? (count / summary.totalOrders) * 100 : 0;
                
                return (
                  <div key={status}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium flex items-center">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} mr-2`} />
                        {getStatusLabel(status)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Produits les Plus Vendus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats.topProducts || []).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.category} • {product.quantity} vendus
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {formatAmount(product.revenue)}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
              {(stats.topProducts || []).length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  Aucune vente enregistrée
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Avis Clients Récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Rating Distribution */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Distribution des Notes</h4>
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = reviews.distribution[rating] || 0;
                  const percentage = reviews.total > 0 ? (count / reviews.total) * 100 : 0;
                  
                  return (
                    <div key={rating} className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center w-16">
                        <span className="text-sm w-2">{rating}</span>
                        <Star className="w-3 h-3 text-yellow-400 fill-current ml-1" />
                      </div>
                      <Progress value={percentage} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground w-8">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Recent Comments */}
              <div className="space-y-3">
                {reviews.recent.map((review, index) => (
                  <div key={index} className="border-l-4 border-primary/20 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                      <div className="flex items-center space-x-2">
                        {review.is_verified && (
                          <Badge variant="secondary" className="text-xs">
                            Vérifié
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                  </div>
                ))}
                {reviews.recent.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    Aucun avis disponible
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
