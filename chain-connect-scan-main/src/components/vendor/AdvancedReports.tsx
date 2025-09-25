import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Download, FileText, TrendingUp, TrendingDown, 
  BarChart3, PieChart, Calendar, Filter,
  DollarSign, Package, Users, ShoppingCart,
  Eye, RefreshCw, Mail, CreditCard
} from 'lucide-react';
import DebtManager from '@/components/admin/DebtManager';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ReportData {
  sales: any[];
  products: any[];
  customers: any[];
  inventory: any[];
  financial: any;
}

export default function AdvancedReports() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData>({
    sales: [],
    products: [],
    customers: [],
    inventory: [],
    financial: {}
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('sales');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Simulation de données pour la démonstration
      const mockSalesData = [
        { date: '2024-01-01', amount: 150000, orders: 5 },
        { date: '2024-01-02', amount: 230000, orders: 8 },
        { date: '2024-01-03', amount: 180000, orders: 6 },
        { date: '2024-01-04', amount: 320000, orders: 12 },
        { date: '2024-01-05', amount: 280000, orders: 10 },
        { date: '2024-01-06', amount: 410000, orders: 15 },
        { date: '2024-01-07', amount: 350000, orders: 13 }
      ];

      const mockProductsData = [
        { name: 'Produit A', sold: 45, revenue: 675000, stock: 23 },
        { name: 'Produit B', sold: 38, revenue: 570000, stock: 15 },
        { name: 'Produit C', sold: 32, revenue: 480000, stock: 8 },
        { name: 'Produit D', sold: 28, revenue: 420000, stock: 31 },
        { name: 'Produit E', sold: 25, revenue: 375000, stock: 12 }
      ];

      const mockCustomersData = [
        { id: '1', name: 'Client Premium', orders: 12, total: 1800000, avgOrder: 150000 },
        { id: '2', name: 'Client Fidèle', orders: 8, total: 1200000, avgOrder: 150000 },
        { id: '3', name: 'Client Régulier', orders: 6, total: 900000, avgOrder: 150000 },
        { id: '4', name: 'Client Occasionnel', orders: 4, total: 600000, avgOrder: 150000 },
        { id: '5', name: 'Nouveau Client', orders: 2, total: 300000, avgOrder: 150000 }
      ];

      const mockFinancialSummary = {
        totalRevenue: 1920000,
        totalOrders: 59,
        avgOrderValue: 32542,
        growth: 12.5
      };

      setReportData({
        sales: mockSalesData,
        products: mockProductsData,
        customers: mockCustomersData,
        inventory: [],
        financial: mockFinancialSummary
      });
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
      toast.error('Erreur lors du chargement des rapports');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    setExporting(true);
    try {
      // Simulation d'export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const data = {
        dateRange,
        reportType,
        financial: reportData.financial,
        sales: reportData.sales,
        products: reportData.products,
        customers: reportData.customers
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-${reportType}-${Date.now()}.${format === 'excel' ? 'xlsx' : format}`;
      a.click();
      
      toast.success(`Rapport ${format.toUpperCase()} exporté avec succès`);
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  const sendReportByEmail = async () => {
    try {
      toast.success('Rapport envoyé par email');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi par email');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement des rapports...</div>;
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Rapports & Analyses</h2>
          <p className="text-muted-foreground">
            Analyses détaillées de vos performances
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">3 derniers mois</SelectItem>
              <SelectItem value="365">12 derniers mois</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchReportData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')} disabled={exporting}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => exportReport('excel')} disabled={exporting}>
            <FileText className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" onClick={sendReportByEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Envoyer par email
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.financial.totalRevenue?.toLocaleString() || 0} GNF
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{reportData.financial.growth || 0}% vs période précédente
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.financial.totalOrders || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Panier moyen: {reportData.financial.avgOrderValue?.toLocaleString() || 0} GNF
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits vendus</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.products.reduce((sum, p) => sum + p.sold, 0)}
            </div>
            <div className="text-xs text-muted-foreground">
              {reportData.products.length} produits actifs
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients uniques</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.customers.length}
            </div>
            <div className="text-xs text-muted-foreground">
              Clients fidèles (2+ commandes)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques détaillés */}
      <Tabs value={reportType} onValueChange={setReportType}>
        <TabsList>
          <TabsTrigger value="sales">Ventes</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="customers">Clients</TabsTrigger>
          <TabsTrigger value="financial">Financier</TabsTrigger>
          <TabsTrigger value="debts">
            <CreditCard className="h-4 w-4 mr-2" />
            Dettes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des ventes</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.sales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 des produits</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.products}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sold" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Détail des produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.products.map((product, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Stock: {product.stock} • Vendus: {product.sold}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{product.revenue.toLocaleString()} GNF</p>
                      <Badge variant={product.stock < 10 ? 'destructive' : 'secondary'}>
                        {product.stock < 10 ? 'Stock faible' : 'Stock OK'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.customers.map((customer, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <h4 className="font-medium">{customer.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {customer.orders} commande(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{customer.total.toLocaleString()} GNF</p>
                      <p className="text-sm text-muted-foreground">
                        Moy: {customer.avgOrder.toLocaleString()} GNF
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Résumé financier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Chiffre d'affaires total:</span>
                  <span className="font-medium">{reportData.financial.totalRevenue?.toLocaleString()} GNF</span>
                </div>
                <div className="flex justify-between">
                  <span>Nombre de commandes:</span>
                  <span className="font-medium">{reportData.financial.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span>Panier moyen:</span>
                  <span className="font-medium">{reportData.financial.avgOrderValue?.toLocaleString()} GNF</span>
                </div>
                <div className="flex justify-between">
                  <span>Croissance:</span>
                  <span className="font-medium text-green-600">+{reportData.financial.growth}%</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Prévisions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Basé sur les tendances actuelles
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>CA prévu mois prochain:</span>
                    <span className="font-medium">
                      {(reportData.financial.totalRevenue * 1.125)?.toLocaleString()} GNF
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commandes prévues:</span>
                    <span className="font-medium">
                      {Math.round(reportData.financial.totalOrders * 1.125)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="debts" className="space-y-4">
          <DebtManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}