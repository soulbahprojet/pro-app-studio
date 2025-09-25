import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDeviceSecurity } from '@/hooks/useDeviceSecurity';
import { 
  Shield, 
  MapPin, 
  AlertTriangle, 
  Smartphone, 
  Lock,
  Eye,
  Activity,
  Phone,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

export default function SecurityDashboard() {
  const {
    isTracking,
    lastLocation,
    deviceInfo,
    securityAlerts,
    startLocationTracking,
    sendEmergencyAlert,
    checkDeviceStatus,
    loadSecurityAlerts
  } = useDeviceSecurity();

  const [emergencyMode, setEmergencyMode] = useState(false);

  useEffect(() => {
    checkDeviceStatus();
    loadSecurityAlerts();
  }, []);

  const handleEmergencyAlert = async (type: 'theft' | 'lost' | 'suspicious_activity') => {
    setEmergencyMode(true);
    
    const messages = {
      theft: 'Tentative de vol détectée sur mon appareil',
      lost: 'Mon appareil a été perdu',
      suspicious_activity: 'Activité suspecte détectée sur mon compte'
    };

    await sendEmergencyAlert(type, messages[type]);
    
    setTimeout(() => setEmergencyMode(false), 3000);
  };

  const getSecurityStatus = () => {
    if (deviceInfo?.is_blocked) return { status: 'Bloqué', color: 'destructive' };
    if (securityAlerts.length > 0) return { status: 'Alertes', color: 'destructive' };
    if (isTracking) return { status: 'Sécurisé', color: 'default' };
    return { status: 'Inactif', color: 'secondary' };
  };

  const securityStatus = getSecurityStatus();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Sécurité de l'Appareil
          </h1>
          <p className="text-muted-foreground">
            Protection et surveillance de votre appareil 224SOLUTIONS
          </p>
        </div>
        <Badge variant={securityStatus.color as any}>
          {securityStatus.status}
        </Badge>
      </div>

      {/* Emergency Mode Alert */}
      {emergencyMode && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            Mode d'urgence activé! Alerte envoyée aux services de sécurité.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Alerts */}
      {securityAlerts.length > 0 && (
        <Alert className="border-orange-500 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-700">
            {securityAlerts.length} alerte(s) de sécurité non résolue(s).
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600">
              <Phone className="h-4 w-4" />
              Urgence - Vol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-full"
              onClick={() => handleEmergencyAlert('theft')}
              disabled={emergencyMode}
            >
              Signaler un Vol
            </Button>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-600">
              <MapPin className="h-4 w-4" />
              Appareil Perdu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-orange-300 text-orange-600"
              onClick={() => handleEmergencyAlert('lost')}
              disabled={emergencyMode}
            >
              Marquer comme Perdu
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-600">
              <Eye className="h-4 w-4" />
              Activité Suspecte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-blue-300 text-blue-600"
              onClick={() => handleEmergencyAlert('suspicious_activity')}
              disabled={emergencyMode}
            >
              Signaler Activité
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Device Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Informations de l'Appareil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deviceInfo ? (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Modèle:</span>
                  <span className="text-sm font-medium">{deviceInfo.device_model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Système:</span>
                  <span className="text-sm font-medium">{deviceInfo.device_os}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Marque:</span>
                  <span className="text-sm font-medium">{deviceInfo.device_brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Statut:</span>
                  <Badge variant={deviceInfo.is_blocked ? 'destructive' : 'default'}>
                    {deviceInfo.is_blocked ? 'Bloqué' : 'Actif'}
                  </Badge>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Chargement des informations...</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localisation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lastLocation ? (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Latitude:</span>
                  <span className="text-sm font-medium">{lastLocation.lat.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Longitude:</span>
                  <span className="text-sm font-medium">{lastLocation.lng.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Précision:</span>
                  <span className="text-sm font-medium">{lastLocation.accuracy}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Statut:</span>
                  <Badge variant={isTracking ? 'default' : 'secondary'}>
                    {isTracking ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Le suivi de localisation n'est pas activé
                </p>
                <Button 
                  onClick={startLocationTracking}
                  size="sm" 
                  className="w-full"
                  disabled={isTracking}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Activer le Suivi
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Fonctionnalités de Sécurité
          </CardTitle>
          <CardDescription>
            Protection avancée pour votre appareil et vos données
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Chiffrement End-to-End</p>
                <p className="text-xs text-muted-foreground">Données protégées</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Surveillance Temps Réel</p>
                <p className="text-xs text-muted-foreground">Détection d'anomalies</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Réponse Automatique</p>
                <p className="text-xs text-muted-foreground">Blocage intelligent</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Alerts */}
      {securityAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertes de Sécurité Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityAlerts.slice(0, 3).map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{alert.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="destructive">
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}