import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  Upload, 
  RefreshCw,
  Database,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface OfflineData {
  id: string;
  type: 'mission' | 'product' | 'order' | 'message';
  data: any;
  timestamp: number;
  synced: boolean;
}

const OfflineManager = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData[]>([]);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connexion rétablie",
        description: "Synchronisation automatique en cours..."
      });
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Mode hors ligne activé",
        description: "Vos données seront synchronisées à la reconnexion",
        variant: "default"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Charger les données hors ligne stockées
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = () => {
    const stored = localStorage.getItem('offlineData');
    if (stored) {
      setOfflineData(JSON.parse(stored));
    }
  };

  const saveOfflineData = (data: OfflineData[]) => {
    localStorage.setItem('offlineData', JSON.stringify(data));
    setOfflineData(data);
  };

  const addOfflineData = (type: OfflineData['type'], data: any) => {
    const newEntry: OfflineData = {
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      synced: false
    };

    const updated = [...offlineData, newEntry];
    saveOfflineData(updated);

    toast({
      title: "Données sauvegardées hors ligne",
      description: `${type} enregistré pour synchronisation ultérieure`
    });
  };

  const syncOfflineData = async () => {
    if (!isOnline || syncInProgress) return;

    setSyncInProgress(true);
    try {
      const unsyncedData = offlineData.filter(item => !item.synced);
      
      for (const item of unsyncedData) {
        // Simuler la synchronisation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Marquer comme synchronisé
        item.synced = true;
      }

      saveOfflineData(offlineData);
      
      toast({
        title: "Synchronisation terminée",
        description: `${unsyncedData.length} éléments synchronisés`
      });
    } catch (error) {
      toast({
        title: "Erreur de synchronisation",
        description: "Certaines données n'ont pas pu être synchronisées",
        variant: "destructive"
      });
    } finally {
      setSyncInProgress(false);
    }
  };

  const clearSyncedData = () => {
    const unsyncedData = offlineData.filter(item => !item.synced);
    saveOfflineData(unsyncedData);
    toast({
      title: "Données nettoyées",
      description: "Les données synchronisées ont été supprimées"
    });
  };

  const getTypeIcon = (type: OfflineData['type']) => {
    switch (type) {
      case 'mission': return '🚚';
      case 'product': return '📦';
      case 'order': return '🛒';
      case 'message': return '💬';
      default: return '📄';
    }
  };

  const unsyncedCount = offlineData.filter(item => !item.synced).length;
  const syncedCount = offlineData.filter(item => item.synced).length;

  return (
    <div className="space-y-6">
      {/* Statut de connexion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Statut de connexion
          </CardTitle>
          <CardDescription>
            Gestion automatique du mode hors ligne
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={isOnline ? "default" : "secondary"}>
                {isOnline ? "En ligne" : "Hors ligne"}
              </Badge>
              {syncInProgress && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Synchronisation...
                </div>
              )}
            </div>
            {isOnline && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={syncOfflineData}
                disabled={syncInProgress || unsyncedCount === 0}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Synchroniser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Données non synchronisées</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unsyncedCount}</div>
            <p className="text-xs text-muted-foreground">
              En attente de synchronisation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Données synchronisées</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncedCount}</div>
            <p className="text-xs text-muted-foreground">
              Synchronisées avec succès
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stockage local</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offlineData.length}</div>
            <p className="text-xs text-muted-foreground">
              Éléments en cache
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des données hors ligne */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Données hors ligne</CardTitle>
              <CardDescription>
                Données stockées localement en attente de synchronisation
              </CardDescription>
            </div>
            {syncedCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearSyncedData}>
                Nettoyer les données synchronisées
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {offlineData.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune donnée hors ligne</p>
              </div>
            ) : (
              offlineData.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getTypeIcon(item.type)}</span>
                    <div>
                      <h4 className="font-medium capitalize">{item.type}</h4>
                      <p className="text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.synced ? "default" : "secondary"}>
                      {item.synced ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Synchronisé
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          En attente
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2"
              onClick={() => addOfflineData('mission', { title: 'Mission test', type: 'delivery' })}
            >
              <Download className="h-6 w-6" />
              <span className="text-sm">Sauvegarder mission</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2"
              onClick={() => addOfflineData('order', { id: 'order-123', status: 'pending' })}
            >
              <Database className="h-6 w-6" />
              <span className="text-sm">Sauvegarder commande</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2"
              onClick={syncOfflineData}
              disabled={!isOnline || syncInProgress}
            >
              <RefreshCw className="h-6 w-6" />
              <span className="text-sm">Forcer la sync</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2"
              onClick={clearSyncedData}
            >
              <Database className="h-6 w-6" />
              <span className="text-sm">Nettoyer cache</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflineManager;