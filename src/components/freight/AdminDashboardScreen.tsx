import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  AlertTriangle,
  Globe,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalShipments: number;
  activeShipments: number;
  deliveredShipments: number;
  totalRevenue: number;
  averageDeliveryTime: number;
  customerSatisfaction: number;
  topCountries: Array<{ country: string; count: number }>;
  monthlyTrends: Array<{ month: string; shipments: number; revenue: number }>;
  statusDistribution: Array<{ status: string; count: number; color: string }>;
  performanceMetrics: {
    onTimeDelivery: number;
    damageRate: number;
    customsClearanceTime: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminDashboardScreen() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [shipments, setShipments] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: '30',
    status: 'all',
    country: 'all',
    transportMode: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard statistics
      const { data: dashboardData, error: dashboardError } = await supabase.functions.invoke('freight-analytics', {
        body: {
          action: 'getDashboardStats',
          filters
        }
      });

      if (dashboardError) throw dashboardError;
      setStats(dashboardData);

      // Fetch recent shipments
      let query = supabase
        .from('international_shipments_complete')
        .select(`
          *,
          freight_forwarder_profiles(company_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.country !== 'all') {
        query = query.or(`sender_country.eq.${filters.country},recipient_country.eq.${filters.country}`);
      }

      if (filters.transportMode !== 'all') {
        query = query.eq('transport_mode', filters.transportMode);
      }

      const { data: shipmentsData, error: shipmentsError } = await query;
      if (shipmentsError) throw shipmentsError;
      setShipments(shipmentsData || []);

      // Fetch active alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('shipment_alerts')
        .select(`
          *,
          international_shipments_complete(tracking_code, sender_country, recipient_country)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      if (alertsError) throw alertsError;
      setAlerts(alertsData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du tableau de bord",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (type: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('freight-analytics', {
        body: {
          action: 'exportData',
          type,
          filters
        }
      });

      if (error) throw error;

      // Create and download file
      const blob = new Blob([data.csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: "Les données ont été exportées avec succès",
        variant: "default"
      });

    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données",
        variant: "destructive"
      });
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('shipment_alerts')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      toast({
        title: "Alerte accusée",
        description: "L'alerte a été marquée comme lue",
        variant: "default"
      });

    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer l'alerte comme lue",
        variant: "destructive"
      });
    }
  };

  const filteredShipments = shipments.filter(shipment =>
    shipment.tracking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.recipient_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      created: 'bg-blue-500',
      picked_up: 'bg-yellow-500',
      in_transit: 'bg-orange-500',
      customs: 'bg-purple-500',
      out_for_delivery: 'bg-green-500',
      delivered: 'bg-green-600',
      exception: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getAlertSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      low: 'border-blue-500 bg-blue-50',
      medium: 'border-yellow-500 bg-yellow-50',
      high: 'border-orange-500 bg-orange-50',
      critical: 'border-red-500 bg-red-50'
    };
    return colors[severity] || 'border-gray-500 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord - Transitaire International</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble des expéditions et performances
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportData('shipments')}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={fetchDashboardData}>
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Période</label>
              <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 derniers jours</SelectItem>
                  <SelectItem value="30">30 derniers jours</SelectItem>
                  <SelectItem value="90">90 derniers jours</SelectItem>
                  <SelectItem value="365">1 an</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Statut</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="created">Créé</SelectItem>
                  <SelectItem value="in_transit">En transit</SelectItem>
                  <SelectItem value="delivered">Livré</SelectItem>
                  <SelectItem value="exception">Exception</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Pays</label>
              <Select value={filters.country} onValueChange={(value) => setFilters(prev => ({ ...prev, country: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les pays</SelectItem>
                  <SelectItem value="USA">États-Unis</SelectItem>
                  <SelectItem value="Guinea">Guinée</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Germany">Allemagne</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Transport</label>
              <Select value={filters.transportMode} onValueChange={(value) => setFilters(prev => ({ ...prev, transportMode: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les modes</SelectItem>
                  <SelectItem value="air">Aérien</SelectItem>
                  <SelectItem value="sea">Maritime</SelectItem>
                  <SelectItem value="road">Routier</SelectItem>
                  <SelectItem value="multimodal">Multimodal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Expéditions</p>
                  <p className="text-2xl font-bold">{stats.totalShipments}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {stats.activeShipments} en cours
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenus</p>
                  <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-2 text-sm text-green-600">
                <TrendingUp className="inline w-4 h-4 mr-1" />
                +12% ce mois
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Délai moyen</p>
                  <p className="text-2xl font-bold">{stats.averageDeliveryTime}j</p>
                </div>
                <Globe className="w-8 h-8 text-orange-600" />
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {stats.performanceMetrics.onTimeDelivery}% à l'heure
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                  <p className="text-2xl font-bold">{stats.customerSatisfaction}%</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <div className="mt-2">
                <Progress value={stats.customerSatisfaction} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="shipments">Expéditions</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Tendances mensuelles</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.monthlyTrends && (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="shipments" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition des statuts</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.statusDistribution && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {stats.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shipments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Expéditions récentes</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredShipments.map((shipment) => (
                  <div key={shipment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(shipment.status)}`} />
                      <div>
                        <p className="font-medium">{shipment.tracking_code}</p>
                        <p className="text-sm text-muted-foreground">
                          {shipment.sender_city}, {shipment.sender_country} → {shipment.recipient_city}, {shipment.recipient_country}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        {shipment.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {new Date(shipment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Alertes actives ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`p-4 border rounded-lg ${getAlertSeverityColor(alert.severity)}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {alert.alert_type}
                          </Badge>
                        </div>
                        <h4 className="font-medium mt-2">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                        {alert.international_shipments_complete && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Expédition: {alert.international_shipments_complete.tracking_code}
                          </p>
                        )}
                        {alert.ai_analysis && (
                          <div className="mt-3 p-3 bg-background rounded border">
                            <h5 className="font-medium text-sm">Analyse IA</h5>
                            <p className="text-sm text-muted-foreground mt-1">
                              {alert.ai_analysis.analysis}
                            </p>
                            {alert.ai_analysis.recommendation && (
                              <p className="text-sm text-blue-600 mt-1">
                                Recommandation: {alert.ai_analysis.recommendation}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Confiance: {Math.round((alert.confidence_score || 0) * 100)}%
                            </p>
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Marquer comme lu
                      </Button>
                    </div>
                  </div>
                ))}
                
                {alerts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune alerte active</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Countries */}
            <Card>
              <CardHeader>
                <CardTitle>Pays les plus actifs</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.topCountries && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.topCountries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="country" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Métriques de performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats?.performanceMetrics && (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Livraisons à l'heure</span>
                        <span className="text-sm text-muted-foreground">
                          {stats.performanceMetrics.onTimeDelivery}%
                        </span>
                      </div>
                      <Progress value={stats.performanceMetrics.onTimeDelivery} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Taux de dommage</span>
                        <span className="text-sm text-muted-foreground">
                          {stats.performanceMetrics.damageRate}%
                        </span>
                      </div>
                      <Progress value={100 - stats.performanceMetrics.damageRate} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Délai douane (jours)</span>
                        <span className="text-sm text-muted-foreground">
                          {stats.performanceMetrics.customsClearanceTime}
                        </span>
                      </div>
                      <Progress value={Math.max(0, 100 - (stats.performanceMetrics.customsClearanceTime * 10))} className="h-2" />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
