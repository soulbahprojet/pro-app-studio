import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Clock, 
  Zap, 
  CheckCircle, 
  TrendingUp, 
  AlertCircle,
  Star,
  Truck,
  Package,
  Timer,
  Target,
  BarChart3,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SLAItem {
  id: string;
  shipment_id: string;
  sla_type: string;
  promised_delivery: string;
  actual_delivery?: string;
  status: string;
  escalation_level: number;
  compensation_amount: number;
  breach_reason?: string;
  created_at: string;
}

const PriorityManagementScreen = () => {
  const { toast } = useToast();
  const [slaItems, setSlaItems] = useState<SLAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  const [stats, setStats] = useState({
    total_sla: 0,
    met_sla: 0,
    breached_sla: 0,
    escalated_sla: 0,
    compensation_total: 0
  });

  useEffect(() => {
    loadSLAData();
  }, []);

  const loadSLAData = async () => {
    try {
      setLoading(true);
      
      // Charger les SLA
      const { data: slaData, error: slaError } = await supabase
        .from('shipment_sla')
        .select('*')
        .order('created_at', { ascending: false });

      if (slaError) throw slaError;
      setSlaItems(slaData || []);

      // Calculer les statistiques
      const total = slaData?.length || 0;
      const met = slaData?.filter(item => item.status === 'met').length || 0;
      const breached = slaData?.filter(item => item.status === 'breached').length || 0;
      const escalated = slaData?.filter(item => item.status === 'escalated').length || 0;
      const compensation = slaData?.reduce((sum, item) => sum + (item.compensation_amount || 0), 0) || 0;

      setStats({
        total_sla: total,
        met_sla: met,
        breached_sla: breached,
        escalated_sla: escalated,
        compensation_total: compensation
      });

    } catch (error) {
      console.error('Error loading SLA data:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données SLA",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEscalation = async (slaId: string, level: number) => {
    try {
      const { error } = await supabase
        .from('shipment_sla')
        .update({
          escalation_level: level,
          status: level > 2 ? 'escalated' : 'active'
        })
        .eq('id', slaId);

      if (error) throw error;

      toast({
        title: "✅ Escalation mise à jour",
        description: `SLA escalé au niveau ${level}`
      });

      loadSLAData();
    } catch (error) {
      console.error('Error escalating SLA:', error);
      toast({
        title: "Erreur d'escalation",
        description: "Impossible de mettre à jour l'escalation",
        variant: "destructive"
      });
    }
  };

  const getSLATypeIcon = (type: string) => {
    switch (type) {
      case 'express': return <Zap className="w-4 h-4 text-red-500" />;
      case 'fragile': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'dangerous': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Package className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSLAStatusColor = (status: string) => {
    switch (status) {
      case 'met': return 'bg-green-500';
      case 'breached': return 'bg-red-500';
      case 'escalated': return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  const getTimeRemaining = (promisedDelivery: string) => {
    const now = new Date();
    const promised = new Date(promisedDelivery);
    const diff = promised.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expiré';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}j ${hours % 24}h`;
    return `${hours}h`;
  };

  const getProgressValue = (promisedDelivery: string) => {
    const now = new Date();
    const promised = new Date(promisedDelivery);
    const created = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Simulé: 7 jours avant
    
    const total = promised.getTime() - created.getTime();
    const elapsed = now.getTime() - created.getTime();
    
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const filteredSLAs = slaItems.filter(item => {
    switch (activeTab) {
      case 'active': return item.status === 'active';
      case 'breached': return item.status === 'breached';
      case 'escalated': return item.status === 'escalated';
      case 'completed': return item.status === 'met';
      default: return true;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            ⚡ Gestion Priorités SLA
          </h2>
          <p className="text-muted-foreground mt-1">
            Monitoring en temps réel des SLA et escalations automatiques
          </p>
        </div>
        <Badge variant="outline" className="bg-gradient-to-r from-orange-50 to-red-50">
          <Target className="w-4 h-4 mr-1" />
          SLA Manager Pro
        </Badge>
      </div>

      {/* Statistiques SLA */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{stats.total_sla}</div>
            <p className="text-sm text-blue-600">Total SLA</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{stats.met_sla}</div>
            <p className="text-sm text-green-600">SLA Respectés</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{stats.breached_sla}</div>
            <p className="text-sm text-red-600">SLA Violés</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-700">{stats.escalated_sla}</div>
            <p className="text-sm text-orange-600">Escalations</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-700">${stats.compensation_total}</div>
            <p className="text-sm text-purple-600">Compensations</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de gestion */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Actifs ({slaItems.filter(i => i.status === 'active').length})
          </TabsTrigger>
          <TabsTrigger value="breached" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Violés ({slaItems.filter(i => i.status === 'breached').length})
          </TabsTrigger>
          <TabsTrigger value="escalated" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Escalés ({slaItems.filter(i => i.status === 'escalated').length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Terminés ({slaItems.filter(i => i.status === 'met').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredSLAs.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-48">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aucun SLA dans cette catégorie
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredSLAs.map((sla) => (
                <Card key={sla.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getSLATypeIcon(sla.sla_type)}
                        <div>
                          <h4 className="font-semibold">
                            Expédition #{sla.shipment_id.slice(0, 8)}
                          </h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            {sla.sla_type} • Niveau {sla.escalation_level}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getSLAStatusColor(sla.status)}>
                          {sla.status}
                        </Badge>
                        {sla.escalation_level > 0 && (
                          <Badge variant="outline" className="text-orange-600">
                            Escalation {sla.escalation_level}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Barre de progression temporelle */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progression SLA</span>
                        <span className="font-medium">
                          {getTimeRemaining(sla.promised_delivery)}
                        </span>
                      </div>
                      <Progress 
                        value={getProgressValue(sla.promised_delivery)} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Créé</span>
                        <span>Livraison prévue: {new Date(sla.promised_delivery).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions d'escalation */}
                    {sla.status === 'active' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEscalation(sla.id, sla.escalation_level + 1)}
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                        >
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Escalader
                        </Button>
                        
                        {sla.escalation_level >= 2 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Urgence Critique
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Compensation */}
                    {sla.compensation_amount > 0 && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">
                            Compensation: ${sla.compensation_amount}
                          </span>
                        </div>
                        {sla.breach_reason && (
                          <p className="text-xs text-yellow-700 mt-1">
                            Raison: {sla.breach_reason}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PriorityManagementScreen;