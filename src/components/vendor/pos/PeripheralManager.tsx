import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Printer, 
  Scan, 
  Scale, 
  CreditCard,
  Wifi,
  WifiOff,
  Settings,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Usb
} from 'lucide-react';

interface Peripheral {
  id: string;
  name: string;
  type: 'printer' | 'scanner' | 'scale' | 'payment' | 'cash_drawer';
  status: 'connected' | 'disconnected' | 'error';
  connection: 'usb' | 'bluetooth' | 'wifi' | 'serial';
  ip?: string;
  port?: string;
  model?: string;
  lastSeen?: string;
}

export function PeripheralManager() {
  const { toast } = useToast();
  
  const [peripherals, setPeripherals] = useState<Peripheral[]>([]);
  const [scanning, setScanning] = useState(false);
  
  // Nouveau périphérique à ajouter
  const [newDevice, setNewDevice] = useState<{
    name: string;
    type: Peripheral['type'];
    connection: Peripheral['connection'];
    ip: string;
    port: string;
  }>({
    name: '',
    type: 'printer',
    connection: 'usb',
    ip: '',
    port: ''
  });

  useEffect(() => {
    loadPeripherals();
  }, []);

  const loadPeripherals = () => {
    // Simulation de périphériques détectés
    const mockPeripherals: Peripheral[] = [
      {
        id: '1',
        name: 'Imprimante de reçus Epson TM-T88V',
        type: 'printer',
        status: 'connected',
        connection: 'usb',
        model: 'TM-T88V',
        lastSeen: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Lecteur de codes-barres Honeywell',
        type: 'scanner',
        status: 'connected',
        connection: 'usb',
        model: 'Voyager 1202g',
        lastSeen: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Tiroir-caisse Star CD3-1616',
        type: 'cash_drawer',
        status: 'disconnected',
        connection: 'serial',
        model: 'CD3-1616',
        lastSeen: '2024-01-14T10:30:00Z'
      },
      {
        id: '4',
        name: 'Balance électronique DIGI',
        type: 'scale',
        status: 'error',
        connection: 'serial',
        model: 'DS-673',
        lastSeen: '2024-01-14T15:20:00Z'
      },
      {
        id: '5',
        name: 'Terminal de paiement Ingenico',
        type: 'payment',
        status: 'connected',
        connection: 'wifi',
        ip: '192.168.1.100',
        model: 'Move/5000',
        lastSeen: new Date().toISOString()
      }
    ];
    
    setPeripherals(mockPeripherals);
  };

  const scanForDevices = async () => {
    setScanning(true);
    
    // Simulation de scan
    setTimeout(() => {
      setScanning(false);
      toast({
        title: "Scan terminé",
        description: "Aucun nouveau périphérique détecté"
      });
    }, 3000);
  };

  const testDevice = (deviceId: string) => {
    const device = peripherals.find(p => p.id === deviceId);
    if (!device) return;

    // Simulation de test
    setTimeout(() => {
      if (device.type === 'printer') {
        toast({
          title: "Test d'impression",
          description: "Page de test envoyée à l'imprimante"
        });
      } else if (device.type === 'scanner') {
        toast({
          title: "Test du scanner",
          description: "Scanner prêt à lire les codes-barres"
        });
      } else if (device.type === 'cash_drawer') {
        toast({
          title: "Test du tiroir",
          description: "Ouverture du tiroir-caisse"
        });
      } else if (device.type === 'scale') {
        toast({
          title: "Test de la balance",
          description: "Poids: 1.25 kg"
        });
      } else if (device.type === 'payment') {
        toast({
          title: "Test du terminal",
          description: "Terminal de paiement opérationnel"
        });
      }
    }, 1000);
  };

  const connectDevice = (deviceId: string) => {
    setPeripherals(prev =>
      prev.map(device =>
        device.id === deviceId
          ? { ...device, status: 'connected', lastSeen: new Date().toISOString() }
          : device
      )
    );
    
    toast({
      title: "Périphérique connecté",
      description: "Connexion établie avec succès"
    });
  };

  const disconnectDevice = (deviceId: string) => {
    setPeripherals(prev =>
      prev.map(device =>
        device.id === deviceId
          ? { ...device, status: 'disconnected' }
          : device
      )
    );
    
    toast({
      title: "Périphérique déconnecté",
      description: "Connexion fermée"
    });
  };

  const addDevice = () => {
    if (!newDevice.name) {
      toast({
        title: "Nom requis",
        description: "Veuillez saisir un nom pour le périphérique",
        variant: "destructive"
      });
      return;
    }

    const device: Peripheral = {
      id: Math.random().toString(36).substr(2, 9),
      ...newDevice,
      status: 'disconnected',
      lastSeen: new Date().toISOString()
    };

    setPeripherals(prev => [...prev, device]);
    
    // Réinitialiser le formulaire
    setNewDevice({
      name: '',
      type: 'printer',
      connection: 'usb',
      ip: '',
      port: ''
    });

    toast({
      title: "Périphérique ajouté",
      description: "Le périphérique a été ajouté à la liste"
    });
  };

  const getDeviceIcon = (type: Peripheral['type']) => {
    switch (type) {
      case 'printer': return <Printer className="w-6 h-6" />;
      case 'scanner': return <Scan className="w-6 h-6" />;
      case 'scale': return <Scale className="w-6 h-6" />;
      case 'payment': return <CreditCard className="w-6 h-6" />;
      case 'cash_drawer': return <div className="w-6 h-6 bg-gray-600 rounded" />;
      default: return <Settings className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: Peripheral['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConnectionIcon = (connection: Peripheral['connection']) => {
    switch (connection) {
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'bluetooth': return <WifiOff className="w-4 h-4" />;
      case 'usb': return <Usb className="w-4 h-4" />;
      case 'serial': return <Settings className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats périphériques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {peripherals.filter(p => p.status === 'connected').length}
                </p>
                <p className="text-sm text-muted-foreground">Connectés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {peripherals.filter(p => p.status === 'error').length}
                </p>
                <p className="text-sm text-muted-foreground">En erreur</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <WifiOff className="w-8 h-8 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">
                  {peripherals.filter(p => p.status === 'disconnected').length}
                </p>
                <p className="text-sm text-muted-foreground">Déconnectés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{peripherals.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des périphériques */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Périphériques POS
                </CardTitle>
                <Button
                  onClick={scanForDevices}
                  disabled={scanning}
                  size="sm"
                >
                  {scanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Scan...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Scanner
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {peripherals.map(device => (
                <Card key={device.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted rounded">
                          {getDeviceIcon(device.type)}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-semibold">{device.name}</h3>
                          {device.model && (
                            <p className="text-sm text-muted-foreground">
                              Modèle: {device.model}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {getConnectionIcon(device.connection)}
                            <span>{device.connection.toUpperCase()}</span>
                            {device.ip && <span>({device.ip})</span>}
                          </div>
                          {device.lastSeen && (
                            <p className="text-xs text-muted-foreground">
                              Dernière activité: {new Date(device.lastSeen).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <Badge className={getStatusColor(device.status)}>
                        {device.status === 'connected' ? 'Connecté' : 
                         device.status === 'disconnected' ? 'Déconnecté' : 'Erreur'}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testDevice(device.id)}
                      >
                        Test
                      </Button>
                      
                      {device.status === 'connected' ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => disconnectDevice(device.id)}
                        >
                          Déconnecter
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => connectDevice(device.id)}
                        >
                          Connecter
                        </Button>
                      )}
                      
                      <Button size="sm" variant="outline">
                        Configurer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Ajouter un périphérique */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Ajouter un périphérique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="device-name">Nom du périphérique</Label>
                <Input
                  id="device-name"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Imprimante caisse"
                />
              </div>
              
              <div>
                <Label htmlFor="device-type">Type</Label>
                <select
                  id="device-type"
                  value={newDevice.type}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, type: e.target.value as Peripheral['type'] }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="printer">Imprimante</option>
                  <option value="scanner">Scanner codes-barres</option>
                  <option value="scale">Balance</option>
                  <option value="payment">Terminal de paiement</option>
                  <option value="cash_drawer">Tiroir-caisse</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="connection-type">Connexion</Label>
                <select
                  id="connection-type"
                  value={newDevice.connection}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, connection: e.target.value as Peripheral['connection'] }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="usb">USB</option>
                  <option value="wifi">Wi-Fi</option>
                  <option value="bluetooth">Bluetooth</option>
                  <option value="serial">Port série</option>
                </select>
              </div>
              
              {newDevice.connection === 'wifi' && (
                <>
                  <div>
                    <Label htmlFor="device-ip">Adresse IP</Label>
                    <Input
                      id="device-ip"
                      value={newDevice.ip}
                      onChange={(e) => setNewDevice(prev => ({ ...prev, ip: e.target.value }))}
                      placeholder="192.168.1.100"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="device-port">Port</Label>
                    <Input
                      id="device-port"
                      value={newDevice.port}
                      onChange={(e) => setNewDevice(prev => ({ ...prev, port: e.target.value }))}
                      placeholder="9100"
                    />
                  </div>
                </>
              )}
              
              <Button onClick={addDevice} className="w-full">
                Ajouter le périphérique
              </Button>
            </CardContent>
          </Card>

          {/* Guide de compatibilité */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Compatibilité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium">Imprimantes recommandées:</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Epson TM-T88V/VI</li>
                  <li>• Star TSP143III</li>
                  <li>• Citizen CT-S310II</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">Scanners recommandés:</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Honeywell Voyager 1202g</li>
                  <li>• Zebra DS2208</li>
                  <li>• Datalogic QuickScan QD2430</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
