import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  Upload, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  MapPin,
  Clock,
  Database,
  Smartphone,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const OfflineManager: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const offlineData = {
    maps: {
      downloaded: 3,
      total: 5,
      size: '145 MB',
      lastUpdate: '2024-01-20 14:30'
    },
    missions: {
      pending: 2,
      completed: 5,
      failed: 0
    },
    storage: {
      used: '245 MB',
      available: '2.1 GB',
      percentage: 12
    }
  };

  const pendingActions = [
    {
      id: 1,
      type: 'mission_update',
      action: 'Mise à jour statut mission',
      data: 'Mission #R001 - Terminée',
      timestamp: '14:32',
      status: 'pending'
    },
    {
      id: 2,
      type: 'location_update',
      action: 'Synchronisation position GPS',
      data: 'Dernière position: Kaloum',
      timestamp: '14:30',
      status: 'pending'
    },
    {
      id: 3,
      type: 'rating_submit',
      action: 'Envoi évaluation client',
      data: 'Note: 5 étoiles pour Mamadou Diallo',
      timestamp: '14:25',
      status: 'completed'
    }
  ];

  const mapRegions = [
    {
      name: 'Conakry Centre',
      downloaded: true,
      size: '45 MB',
      lastUpdate: '2024-01-20'
    },
    {
      name: 'Kaloum',
      downloaded: true,
      size: '38 MB',
      lastUpdate: '2024-01-20'
    },
    {
      name: 'Ratoma',
      downloaded: true,
      size: '62 MB',
      lastUpdate: '2024-01-19'
    },
    {
      name: 'Matoto',
      downloaded: false,
      size: '55 MB',
      lastUpdate: null
    },
    {
      name: 'Dixinn',
      downloaded: false,
      size: '41 MB',
      lastUpdate: null
    }
  ];

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncProgress(0);
    
    // Simulation de synchronisation
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setSyncProgress(i);
    }
    
    setIsSyncing(false);
    toast({
      title: "Synchronisation terminée",
      description: "Toutes les données ont été synchronisées avec succès.",
    });
  };

  const handleDownloadMap = (regionName: string) => {
    toast({
      title: "Téléchargement démarré",
      description: `Téléchargement de la carte ${regionName} en cours...`,
    });
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'mission_update': return <CheckCircle className="h-4 w-4" />;
      case 'location_update': return <MapPin className="h-4 w-4" />;
      case 'rating_submit': return <Upload className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className={`border-l-4 ${isOnline ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Wifi className="h-8 w-8 text-green-600" />
              ) : (
                <WifiOff className="h-8 w-8 text-red-600" />
              )}
              <div>
                <h3 className="text-lg font-semibold">
                  {isOnline ? 'Connecté à Internet' : 'Mode hors ligne'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isOnline 
                    ? 'Toutes les fonctionnalités sont disponibles'
                    : 'Fonctionnement en mode hors ligne - Les missions acceptées restent accessibles'
                  }
                </p>
              </div>
            </div>
            
            {isOnline && (
              <Button 
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
              </Button>
            )}
          </div>
          
          {isSyncing && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Synchronisation en cours...</span>
                <span className="text-sm">{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Usage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cartes téléchargées</p>
                <p className="text-2xl font-bold">{offlineData.maps.downloaded}/{offlineData.maps.total}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actions en attente</p>
                <p className="text-2xl font-bold">{offlineData.missions.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stockage utilisé</p>
                <p className="text-2xl font-bold">{offlineData.storage.used}</p>
                <Progress value={offlineData.storage.percentage} className="mt-2" />
              </div>
              <Smartphone className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Actions en attente de synchronisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingActions.map((action) => (
              <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    action.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {getActionIcon(action.type)}
                  </div>
                  <div>
                    <p className="font-medium">{action.action}</p>
                    <p className="text-sm text-muted-foreground">{action.data}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{action.timestamp}</span>
                  <Badge 
                    variant={action.status === 'completed' ? 'default' : 'secondary'}
                    className={action.status === 'completed' ? 'bg-green-600' : ''}
                  >
                    {action.status === 'completed' ? 'Terminé' : 'En attente'}
                  </Badge>
                </div>
              </div>
            ))}
            
            {pendingActions.filter(a => a.status === 'pending').length === 0 && (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium">Tout est synchronisé !</p>
                <p className="text-muted-foreground">Aucune action en attente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Offline Maps Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Gestion des cartes hors ligne
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mapRegions.map((region, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    region.downloaded ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{region.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Taille: {region.size}
                      {region.lastUpdate && ` • Mis à jour: ${region.lastUpdate}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={region.downloaded ? 'default' : 'outline'}>
                    {region.downloaded ? 'Téléchargée' : 'Non téléchargée'}
                  </Badge>
                  
                  {region.downloaded ? (
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Mettre à jour
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => handleDownloadMap(region.name)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Offline Mode Features */}
      <Card>
        <CardHeader>
          <CardTitle>Fonctionnalités disponibles hors ligne</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">✓ Disponible hors ligne</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Navigation GPS (avec cartes téléchargées)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Missions acceptées précédemment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Historique des courses
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Informations de profil
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Finalisation des courses en cours
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-red-600">✗ Connexion requise</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Nouvelles demandes de missions
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Communication avec les clients
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Mises à jour de statut en temps réel
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Synchronisation des revenus
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Téléchargement de nouvelles cartes
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflineManager;