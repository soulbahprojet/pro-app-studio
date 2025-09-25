import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import EnhancedMapComponent from './EnhancedMapComponent';
import { 
  Package, 
  Warehouse, 
  MapPin, 
  Search,
  Truck,
  Globe,
  Calendar,
  BarChart,
  Archive,
  Navigation
} from 'lucide-react';

interface Warehouse {
  id: string;
  name: string;
  country: string;
  city?: string;
  coordinates: [number, number];
  capacity?: number;
  current_packages?: number;
  manager_id?: string;
  is_active: boolean;
  address?: string;
  phone?: string;
  seller_id?: string;
}

interface Package {
  id: string;
  tracking_code: string;
  origin_warehouse_id?: string;
  destination_warehouse_id?: string;
  current_location: [number, number];
  status: string;
  recipient_name: string;
  created_at: string;
  [key: string]: any; // Allow additional properties
}

const FreightMapInterface: React.FC = () => {
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [trackingCode, setTrackingCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [mapMarkers, setMapMarkers] = useState<any[]>([]);

  // Fetch warehouses and packages
  useEffect(() => {
    fetchWarehouses();
    fetchPackages();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('is_active', true);
      
      if (!error && data) {
        // Mock coordinates for demo - replace with real data
        const warehousesWithCoords: Warehouse[] = data.map((warehouse, index) => ({
          ...warehouse,
          coordinates: [
            -9.644 + (index * 0.1), // Spread around Conakry
            9.641 + (index * 0.1)
          ] as [number, number],
          city: (warehouse as any).city || warehouse.address || 'Ville inconnue',
          capacity: (warehouse as any).capacity || 1000,
          current_packages: (warehouse as any).current_packages || Math.floor(Math.random() * 500),
          manager_id: (warehouse as any).manager_id || warehouse.seller_id
        }));
        setWarehouses(warehousesWithCoords);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('shipments_international_extended')
        .select('*')
        .limit(50)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        // Mock current locations for demo
        const packagesWithLocations: Package[] = data.map((pkg, index) => ({
          ...pkg,
          current_location: [
            -9.644 + (Math.random() * 0.2 - 0.1),
            9.641 + (Math.random() * 0.2 - 0.1)
          ] as [number, number],
          origin_warehouse_id: (pkg as any).origin_warehouse_id || 'unknown',
          destination_warehouse_id: (pkg as any).destination_warehouse_id || 'unknown'
        }));
        setPackages(packagesWithLocations);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  // Update map markers
  useEffect(() => {
    const markers = [];

    // Add warehouse markers
    warehouses.forEach(warehouse => {
      const utilizationRate = (warehouse.current_packages || 0) / (warehouse.capacity || 1);
      let status = 'Normal';
      if (utilizationRate > 0.8) status = 'Plein';
      else if (utilizationRate > 0.6) status = 'Occupé';

      markers.push({
        id: `warehouse-${warehouse.id}`,
        coordinates: warehouse.coordinates,
        type: 'warehouse',
        title: warehouse.name,
        description: `${warehouse.city}, ${warehouse.country}`,
        status: status,
        color: '#22c55e', // VERT spécifique transitaire/freight
        icon: '🏭',
        data: warehouse
      });
    });

    // Add package markers (if tracking specific packages)
    if (selectedPackage) {
      const pkg = packages.find(p => p.id === selectedPackage);
      if (pkg) {
        markers.push({
          id: `package-${pkg.id}`,
          coordinates: pkg.current_location,
          type: 'package',
          title: `Colis ${pkg.tracking_code}`,
          description: `Destinataire: ${pkg.recipient_name}`,
          status: pkg.status,
          color: '#22c55e', // VERT spécifique transitaire/freight
          icon: '📦',
          data: pkg
        });
      }
    }

    // Add multiple packages if tracking all
    if (!selectedPackage && trackingCode === '') {
      packages.slice(0, 10).forEach(pkg => {
        markers.push({
          id: `package-${pkg.id}`,
          coordinates: pkg.current_location,
          type: 'package',
          title: pkg.tracking_code,
          description: `Status: ${pkg.status}`,
          status: pkg.status,
          color: '#22c55e', // VERT spécifique transitaire/freight
          icon: '📦',
          data: pkg
        });
      });
    }

    setMapMarkers(markers);
  }, [warehouses, packages, selectedWarehouse, selectedPackage, trackingCode]);

  const handleMarkerClick = (marker: any) => {
    console.log('Marker clicked:', marker);
    if (marker.type === 'warehouse') {
      setSelectedWarehouse(marker.data.id);
    } else if (marker.type === 'pickup') {
      setSelectedPackage(marker.data.id);
    }
  };

  const handleTrackPackage = async () => {
    if (!trackingCode.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('shipments_international_extended')
        .select('*')
        .eq('tracking_code', trackingCode.toUpperCase())
        .single();

      if (!error && data) {
        setSelectedPackage(data.id);
        // Mock current location
        const packageWithLocation: Package = {
          ...data,
          current_location: [
            -9.644 + (Math.random() * 0.2 - 0.1),
            9.641 + (Math.random() * 0.2 - 0.1)
          ] as [number, number],
          origin_warehouse_id: (data as any).origin_warehouse_id || 'unknown',
          destination_warehouse_id: (data as any).destination_warehouse_id || 'unknown'
        };
        setPackages(prev => [packageWithLocation, ...prev.filter(p => p.id !== data.id)]);
      } else {
        alert('Colis non trouvé');
      }
    } catch (error) {
      console.error('Error tracking package:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWarehouseById = (id: string) => warehouses.find(w => w.id === id);
  const getPackageById = (id: string) => packages.find(p => p.id === id);

  return (
    <div className="space-y-6">
      {/* Freight Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Suivi Logistique International
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Entrepôts Actifs</label>
              <Badge variant="default" className="w-full justify-center">
                <Warehouse className="w-3 h-3 mr-1" />
                {warehouses.length}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Colis en Transit</label>
              <Badge variant="outline" className="w-full justify-center">
                <Package className="w-3 h-3 mr-1" />
                {packages.filter(p => p.status === 'in_transit').length}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Livraisons Aujourd'hui</label>
              <Badge variant="secondary" className="w-full justify-center">
                <Truck className="w-3 h-3 mr-1" />
                {packages.filter(p => p.status === 'delivered' && 
                  new Date(p.created_at).toDateString() === new Date().toDateString()).length}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Capacité Totale</label>
              <Badge variant="outline" className="w-full justify-center">
                <Archive className="w-3 h-3 mr-1" />
                {warehouses.reduce((acc, w) => acc + (w.capacity || 0), 0)}
              </Badge>
            </div>
          </div>

          {/* Package Tracking */}
          <div className="space-y-2">
            <Label htmlFor="tracking-code">Suivi de Colis</Label>
            <div className="flex gap-2">
              <Input
                id="tracking-code"
                placeholder="Entrez le code de suivi (ex: INTL-1234567)"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleTrackPackage()}
              />
              <Button 
                onClick={handleTrackPackage} 
                disabled={isLoading || !trackingCode.trim()}
                className="flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {isLoading ? 'Recherche...' : 'Suivre'}
              </Button>
            </div>
          </div>

          {/* Warehouse Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Entrepôt Sélectionné</Label>
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="w-full p-2 border rounded-lg bg-background"
              >
                <option value="">Tous les entrepôts</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} - {warehouse.city}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Colis Sélectionné</Label>
              <select
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                className="w-full p-2 border rounded-lg bg-background"
              >
                <option value="">Tous les colis</option>
                {packages.slice(0, 20).map(pkg => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.tracking_code} - {pkg.recipient_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Map */}
      <EnhancedMapComponent
        markers={mapMarkers}
        showSearch={true}
        showDirections={false}
        showRoutes={false}
        onMarkerClick={handleMarkerClick}
        height="500px"
        className="w-full"
      />

      {/* Selected Warehouse Details */}
      {selectedWarehouse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="w-5 h-5" />
              Détails de l'Entrepôt
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const warehouse = getWarehouseById(selectedWarehouse);
              if (!warehouse) return null;
              
              const utilizationRate = ((warehouse.current_packages || 0) / (warehouse.capacity || 1) * 100).toFixed(1);
              
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Nom</label>
                    <div className="font-medium">{warehouse.name}</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Localisation</label>
                    <div className="font-medium">{warehouse.city}, {warehouse.country}</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Capacité</label>
                    <div className="font-medium">{warehouse.current_packages || 0} / {warehouse.capacity || 0}</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Utilisation</label>
                    <div className="font-medium">
                      <span className={`${parseFloat(utilizationRate) > 80 ? 'text-red-500' : 
                        parseFloat(utilizationRate) > 60 ? 'text-orange-500' : 'text-green-500'}`}>
                        {utilizationRate}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Selected Package Details */}
      {selectedPackage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Détails du Colis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const pkg = getPackageById(selectedPackage);
              if (!pkg) return null;
              
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Code de Suivi</label>
                      <div className="font-mono font-medium">{pkg.tracking_code}</div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Destinataire</label>
                      <div className="font-medium">{pkg.recipient_name}</div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Statut</label>
                      <Badge variant="outline" className={
                        pkg.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        pkg.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                        pkg.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {pkg.status}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Date de Création</label>
                      <div className="font-medium">
                        {new Date(pkg.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Position Actuelle</label>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="font-mono text-sm">
                          {pkg.current_location[1].toFixed(6)}, {pkg.current_location[0].toFixed(6)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Dernière Mise à Jour</label>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {new Date().toLocaleString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FreightMapInterface;
