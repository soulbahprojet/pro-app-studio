import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  MessageSquare,
  Phone,
  Shield
} from 'lucide-react';

interface SyndicatAlert {
  id: string;
  titre: string;
  message: string;
  severity: 'info' | 'warning' | 'critique';
  is_read: boolean;
  date_created: string;
  destinataire_type: string;
}

interface SyndicatCriticalAlertsProps {
  bureauToken: string;
  destinataireType: 'bureau_syndical' | 'travailleur';
  destinataireId?: string;
}

const SyndicatCriticalAlerts: React.FC<SyndicatCriticalAlertsProps> = ({ 
  bureauToken, 
  destinataireType,
  destinataireId 
}) => {
  const { toast } = useToast();
  const [alertes, setAlertes] = useState<SyndicatAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlertes();
  }, []);

  const loadAlertes = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('alertes')
        .select('*')
        .eq('destinataire_type', destinataireType)
        .order('date_created', { ascending: false })
        .limit(10);

      if (destinataireId) {
        query = query.eq('destinataire_id', destinataireId);
      }

      const { data: alertesData, error } = await query;
      
      if (error) {
        console.error('Erreur chargement alertes:', error);
        return;
      }

      if (alertesData) {
        setAlertes(alertesData);
      }

    } catch (error) {
      console.error('Erreur chargement alertes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les alertes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alerteId: string) => {
    try {
      const { error } = await supabase
        .from('alertes')
        .update({ is_read: true })
        .eq('id', alerteId);

      if (error) throw error;

      setAlertes(prev => prev.map(alerte => 
        alerte.id === alerteId 
          ? { ...alerte, is_read: true }
          : alerte
      ));

    } catch (error) {
      console.error('Erreur marquage lecture:', error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer comme lu",
        variant: "destructive"
      });
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critique':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Shield className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const config = {
      critique: { variant: 'destructive', label: 'Critique' },
      warning: { variant: 'secondary', label: 'Attention' },
      info: { variant: 'outline', label: 'Information' }
    };
    
    const { variant, label } = config[severity] || config.info;
    
    return <Badge variant={variant}>{label}</Badge>;
  };

  const alertesCritiques = alertes.filter(a => a.severity === 'critique');
  const alertesWarning = alertes.filter(a => a.severity === 'warning');
  const alertesNonLues = alertes.filter(a => !a.is_read);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques d'alertes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes Critiques</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alertesCritiques.length}</div>
            <p className="text-xs text-muted-foreground">
              Intervention requise
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avertissements</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{alertesWarning.length}</div>
            <p className="text-xs text-muted-foreground">
              Attention nécessaire
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non Lues</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{alertesNonLues.length}</div>
            <p className="text-xs text-muted-foreground">
              À traiter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des alertes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alertes du Bureau Syndical
          </CardTitle>
          <CardDescription>
            Alertes critiques et notifications importantes pour le syndicat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alertes.map((alerte) => (
              <Alert 
                key={alerte.id} 
                className={`${!alerte.is_read ? 'border-l-4 border-l-blue-500' : ''} ${
                  alerte.severity === 'critique' ? 'border-red-200 bg-red-50' :
                  alerte.severity === 'warning' ? 'border-orange-200 bg-orange-50' :
                  'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getSeverityIcon(alerte.severity)}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{alerte.titre}</h4>
                        {getSeverityBadge(alerte.severity)}
                        {!alerte.is_read && <Badge variant="default">Nouveau</Badge>}
                      </div>
                      <AlertDescription className="text-sm">
                        {alerte.message}
                      </AlertDescription>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alerte.date_created).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {!alerte.is_read && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => markAsRead(alerte.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Marquer lu
                      </Button>
                    )}
                    
                    {alerte.severity === 'critique' && (
                      <>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Répondre
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4 mr-1" />
                          Appeler
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
            
            {alertes.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  Aucune alerte pour le moment
                </p>
                <p className="text-sm text-muted-foreground">
                  Toutes les activités du syndicat fonctionnent normalement
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides pour alertes critiques */}
      {alertesCritiques.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Actions d'Urgence Requises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-red-600">
                {alertesCritiques.length} alerte(s) critique(s) nécessitent une intervention immédiate
              </p>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm">
                  <Phone className="w-4 h-4 mr-2" />
                  Contacter Équipe Technique
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Signaler Problème
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SyndicatCriticalAlerts;