import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Users, Badge, DollarSign, AlertTriangle, TrendingUp, Download, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const StatisticsDashboard = () => {
  const { toast } = useToast();
  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeBadges: 0,
    expiredBadges: 0,
    ticketsSold: 0,
    sosAlerts: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    activeToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, [period]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // Using mock data for now since the tables are newly created
      // TODO: Replace with real database queries once tables are populated
      const mockStats = {
        totalMembers: 152,
        activeBadges: 142,
        expiredBadges: 10,
        ticketsSold: 1847,
        sosAlerts: 12,
        totalRevenue: 2450000,
        monthlyGrowth: 15.3,
        activeToday: 121
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Generate CSV data
    const csvData = [
      ['Métrique', 'Valeur'],
      ['Total Membres', stats.totalMembers],
      ['Badges Actifs', stats.activeBadges],
      ['Badges Expirés', stats.expiredBadges],
      ['Tickets Vendus', stats.ticketsSold],
      ['Alertes SOS', stats.sosAlerts],
      ['Revenus Total', `${stats.totalRevenue} GNF`],
      ['Croissance Mensuelle', `${stats.monthlyGrowth}%`],
      ['Actifs Aujourd\'hui', stats.activeToday]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rapport-syndicat-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Rapport exporté",
      description: "Le rapport a été téléchargé avec succès",
    });
  };

  const StatCard = ({ title, value, icon: Icon, description, trend }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend && (
          <div className="flex items-center pt-1">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-500">+{trend}% ce mois</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Statistiques et Rapports</h2>
          <p className="text-muted-foreground">Analyses de performance et activité du syndicat</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">7 jours</SelectItem>
              <SelectItem value="month">30 jours</SelectItem>
              <SelectItem value="quarter">3 mois</SelectItem>
              <SelectItem value="year">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Membres"
          value={stats.totalMembers}
          icon={Users}
          description="Taxi-motos enregistrés"
          trend={stats.monthlyGrowth}
        />
        <StatCard
          title="Badges Actifs"
          value={stats.activeBadges}
          icon={Badge}
          description="Badges valides"
        />
        <StatCard
          title="Revenus"
          value={`${stats.totalRevenue.toLocaleString()} GNF`}
          icon={DollarSign}
          description="Tickets et cotisations"
        />
        <StatCard
          title="Alertes SOS"
          value={stats.sosAlerts}
          icon={AlertTriangle}
          description="Incidents signalés"
        />
      </div>

      {/* Detailed Statistics */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList>
          <TabsTrigger value="members">Membres</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="financial">Finances</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Membres Actifs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.activeToday}</div>
                <p className="text-sm text-muted-foreground">Actifs aujourd'hui</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nouveaux Membres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">+{Math.floor(stats.totalMembers * 0.1)}</div>
                <p className="text-sm text-muted-foreground">Ce mois</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Taux d'Activité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {stats.totalMembers > 0 ? Math.round((stats.activeToday / stats.totalMembers) * 100) : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Membres actifs</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Badges Valides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.activeBadges}</div>
                <p className="text-sm text-muted-foreground">En cours de validité</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Badges Expirés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.expiredBadges}</div>
                <p className="text-sm text-muted-foreground">Nécessitent renouvellement</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tickets Vendus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.ticketsSold}</div>
                <p className="text-sm text-muted-foreground">Taxe routière</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenus par Source</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Tickets routiers</span>
                  <span className="font-semibold">{Math.floor(stats.totalRevenue * 0.7).toLocaleString()} GNF</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cotisations</span>
                  <span className="font-semibold">{Math.floor(stats.totalRevenue * 0.2).toLocaleString()} GNF</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Badges</span>
                  <span className="font-semibold">{Math.floor(stats.totalRevenue * 0.1).toLocaleString()} GNF</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span>{stats.totalRevenue.toLocaleString()} GNF</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Alertes SOS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.sosAlerts}</div>
                <p className="text-sm text-muted-foreground">Incidents signalés</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Temps de Réponse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">2.5 min</div>
                <p className="text-sm text-muted-foreground">Moyenne d'intervention</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatisticsDashboard;