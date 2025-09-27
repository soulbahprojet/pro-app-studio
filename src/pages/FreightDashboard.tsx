import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  Ship, 
  Plane, 
  Truck, 
  Package,
  MapPin, 
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Globe,
  Anchor,
  Building,
  Phone,
  Mail
} from 'lucide-react';

interface Shipment {
  id: string;
  trackingNumber: string;
  customerName: string;
  customerEmail: string;
  origin: string;
  destination: string;
  transportMode: 'air' | 'sea' | 'road';
  status: 'pending' | 'in_transit' | 'customs' | 'delivered' | 'delayed';
  departureDate: string;
  estimatedArrival: string;
  actualArrival?: string;
  weight: number;
  volume: number;
  value: number;
  currency: string;
  containerNumber?: string;
  flightNumber?: string;
  vesselName?: string;
  priority: 'standard' | 'express' | 'urgent';
  documentsComplete: boolean;
}

interface FreightStats {
  totalShipments: number;
  inTransit: number;
  delivered: number;
  pending: number;
  delayed: number;
  totalValue: number;
  monthlyRevenue: number;
  customsClearance: number;
  documentsPending: number;
}

export default function FreightDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'shipments' | 'tracking' | 'documents' | 'analytics'>('shipments');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTransport, setSelectedTransport] = useState<string>('all');

  const [stats, setStats] = useState<FreightStats>({
    totalShipments: 342,
    inTransit: 156,
    delivered: 178,
    pending: 23,
    delayed: 8,
    totalValue: 2580000000, // en CFA
    monthlyRevenue: 145000000,
    customsClearance: 34,
    documentsPending: 12
  });

  const [shipments, setShipments] = useState<Shipment[]>([
    {
      id: 'SHP-001',
      trackingNumber: 'FRT-2024-001-DAK',
      customerName: 'SONATEL SA',
      customerEmail: 'logistics@sonatel.sn',
      origin: 'Shanghai, Chine',
      destination: 'Port de Dakar, Sénégal',
      transportMode: 'sea',
      status: 'in_transit',
      departureDate: '2024-01-10',
      estimatedArrival: '2024-02-15',
      weight: 12500,
      volume: 45.6,
      value: 850000000,
      currency: 'CFA',
      containerNumber: 'MSCU-1234567',
      vesselName: 'MSC Seaside',
      priority: 'standard',
      documentsComplete: true
    },
    {
      id: 'SHP-002',
      trackingNumber: 'FRT-2024-002-AIR',
      customerName: 'Pharmacie Nationale',
      customerEmail: 'import@pna.sn',
      origin: 'Mumbai, Inde',
      destination: 'Aéroport LSS, Dakar',
      transportMode: 'air',
      status: 'customs',
      departureDate: '2024-01-18',
      estimatedArrival: '2024-01-20',
      actualArrival: '2024-01-20',
      weight: 2300,
      volume: 8.5,
      value: 125000000,
      currency: 'CFA',
      flightNumber: 'AI-204',
      priority: 'urgent',
      documentsComplete: false
    },
    {
      id: 'SHP-003',
      trackingNumber: 'FRT-2024-003-ROAD',
      customerName: 'SENELEC',
      customerEmail: 'procurement@senelec.sn',
      origin: 'Casablanca, Maroc',
      destination: 'Dakar, Sénégal',
      transportMode: 'road',
      status: 'delivered',
      departureDate: '2024-01-12',
      estimatedArrival: '2024-01-18',
      actualArrival: '2024-01-17',
      weight: 8750,
      volume: 22.3,
      value: 456000000,
      currency: 'CFA',
      priority: 'express',
      documentsComplete: true
    }
  ]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'outline' as const, text: 'En attente', color: 'bg-gray-100 text-gray-700' },
      in_transit: { variant: 'default' as const, text: 'En transit', color: 'bg-blue-100 text-blue-700' },
      customs: { variant: 'secondary' as const, text: 'Douanes', color: 'bg-yellow-100 text-yellow-700' },
      delivered: { variant: 'default' as const, text: 'Livré', color: 'bg-green-100 text-green-700' },
      delayed: { variant: 'destructive' as const, text: 'Retardé', color: 'bg-red-100 text-red-700' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'air': return <Plane className="text-blue-600" size={16} />;
      case 'sea': return <Ship className="text-blue-800" size={16} />;
      case 'road': return <Truck className="text-green-600" size={16} />;
      default: return <Package size={16} />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      standard: 'bg-gray-100 text-gray-600',
      express: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    
    return (
      <Badge className={colors[priority as keyof typeof colors]}>
        {priority === 'urgent' ? '🚨 Urgent' : 
         priority === 'express' ? '⚡ Express' : '📦 Standard'}
      </Badge>
    );
  };

  const updateShipmentStatus = (shipmentId: string, newStatus: string) => {
    setShipments(shipments.map(shipment => 
      shipment.id === shipmentId ? { ...shipment, status: newStatus as any } : shipment
    ));
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || shipment.status === selectedStatus;
    const matchesTransport = selectedTransport === 'all' || shipment.transportMode === selectedTransport;
    return matchesSearch && matchesStatus && matchesTransport;
  });

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <Globe className="text-blue-600" size={32} />
          <h1 className="text-4xl font-bold">Transitaire International</h1>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-600 font-medium">Service 24/7</span>
          </div>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Gestion professionnelle des expéditions internationales et transit douanier
        </p>
        <div className="flex justify-center items-center space-x-8 text-sm">
          <div className="flex items-center space-x-2">
            <Ship className="text-blue-600" size={16} />
            <span>Fret maritime</span>
          </div>
          <div className="flex items-center space-x-2">
            <Plane className="text-blue-600" size={16} />
            <span>Fret aérien</span>
          </div>
          <div className="flex items-center space-x-2">
            <Truck className="text-green-600" size={16} />
            <span>Transport routier</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="text-purple-600" size={16} />
            <span>Dédouanement</span>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expéditions Actives</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inTransit}</div>
            <p className="text-xs text-muted-foreground">
              sur {stats.totalShipments} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur en Transit</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.totalValue / 1000000000).toFixed(1)}G CFA</div>
            <p className="text-xs text-green-600">
              +18% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dédouanement</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customsClearance}</div>
            <p className="text-xs text-orange-600">
              {stats.documentsPending} documents en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Livraison</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.8%</div>
            <p className="text-xs text-green-600">
              Dans les délais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation par onglets */}
      <Card>
        <CardHeader>
          <div className="flex space-x-1">
            {[
              { id: 'shipments', label: 'Expéditions', icon: <Package size={16} /> },
              { id: 'tracking', label: 'Suivi', icon: <MapPin size={16} /> },
              { id: 'documents', label: 'Documents', icon: <FileText size={16} /> },
              { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={selectedTab === tab.id ? "default" : "ghost"}
                onClick={() => setSelectedTab(tab.id as any)}
                className="flex items-center space-x-2"
              >
                {tab.icon}
                <span>{tab.label}</span>
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {/* Section Expéditions */}
          {selectedTab === 'shipments' && (
            <div className="space-y-4">
              {/* Filtres et recherche */}
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    placeholder="Rechercher par numéro de suivi, client, origine..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="in_transit">En transit</option>
                  <option value="customs">Douanes</option>
                  <option value="delivered">Livré</option>
                  <option value="delayed">Retardé</option>
                </select>
                <select 
                  value={selectedTransport}
                  onChange={(e) => setSelectedTransport(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">Tous les transports</option>
                  <option value="air">Aérien</option>
                  <option value="sea">Maritime</option>
                  <option value="road">Routier</option>
                </select>
                <Button variant="outline">
                  <Download size={16} className="mr-2" />
                  Exporter
                </Button>
              </div>

              {/* Liste des expéditions */}
              <div className="space-y-4">
                {filteredShipments.map((shipment) => (
                  <div key={shipment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold">{shipment.trackingNumber}</h3>
                          {getStatusBadge(shipment.status)}
                          {getPriorityBadge(shipment.priority)}
                          <div className="flex items-center space-x-1">
                            {getTransportIcon(shipment.transportMode)}
                            <span className="text-sm text-muted-foreground">
                              {shipment.transportMode === 'air' ? 'Aérien' :
                               shipment.transportMode === 'sea' ? 'Maritime' : 'Routier'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Building size={14} className="text-muted-foreground" />
                              <span className="font-medium">{shipment.customerName}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail size={14} className="text-muted-foreground" />
                              <span className="text-sm">{shipment.customerEmail}</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <MapPin size={14} className="text-muted-foreground mt-0.5" />
                              <div className="text-sm">
                                <p><strong>De:</strong> {shipment.origin}</p>
                                <p><strong>Vers:</strong> {shipment.destination}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Calendar size={14} className="text-muted-foreground" />
                              <span className="text-sm">Départ: {shipment.departureDate}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock size={14} className="text-muted-foreground" />
                              <span className="text-sm">
                                Arrivée prévue: {shipment.estimatedArrival}
                                {shipment.actualArrival && ` (Réelle: ${shipment.actualArrival})`}
                              </span>
                            </div>
                            <div className="text-sm space-y-1">
                              <p>Poids: {shipment.weight.toLocaleString()} kg • Volume: {shipment.volume} m³</p>
                              <p className="font-medium">Valeur: {shipment.value.toLocaleString()} {shipment.currency}</p>
                              {shipment.containerNumber && <p>Conteneur: {shipment.containerNumber}</p>}
                              {shipment.flightNumber && <p>Vol: {shipment.flightNumber}</p>}
                              {shipment.vesselName && <p>Navire: {shipment.vesselName}</p>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <FileText size={12} />
                            <span>Documents: {shipment.documentsComplete ? '✅ Complets' : '⚠️ Incomplets'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye size={14} className="mr-1" />
                          Suivi
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText size={14} className="mr-1" />
                          Documents
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit size={14} className="mr-1" />
                          Modifier
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section Suivi */}
          {selectedTab === 'tracking' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Suivi en Temps Réel</h3>
              
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Carte simulée */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin size={20} />
                      <span>Localisation Mondiale</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 h-64 rounded-lg flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Globe className="mx-auto text-blue-600" size={48} />
                        <p className="text-muted-foreground font-medium">Carte de Suivi Global</p>
                        <p className="text-sm text-muted-foreground">{stats.inTransit} expéditions en cours</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Alertes et notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertCircle size={20} />
                      <span>Alertes Récentes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="border-l-4 border-red-500 pl-4 py-2">
                      <p className="font-medium text-red-700">Retard douanier</p>
                      <p className="text-sm text-muted-foreground">FRT-2024-002-AIR - Documents manquants</p>
                      <p className="text-xs text-muted-foreground">Il y a 2h</p>
                    </div>
                    <div className="border-l-4 border-yellow-500 pl-4 py-2">
                      <p className="font-medium text-yellow-700">Conditions météo</p>
                      <p className="text-sm text-muted-foreground">Vol AI-204 reporté de 3h</p>
                      <p className="text-xs text-muted-foreground">Il y a 4h</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4 py-2">
                      <p className="font-medium text-green-700">Livraison réussie</p>
                      <p className="text-sm text-muted-foreground">FRT-2024-003-ROAD - 1 jour d'avance</p>
                      <p className="text-xs text-muted-foreground">Il y a 6h</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Section Documents */}
          {selectedTab === 'documents' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Gestion Documentaire</h3>
              
              <div className="grid lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Documents En Attente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.documentsPending}</div>
                    <p className="text-xs text-orange-600">À traiter en priorité</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Dédouanement en Cours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.customsClearance}</div>
                    <p className="text-xs text-blue-600">Procédures douanières</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Documents Validés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">156</div>
                    <p className="text-xs text-green-600">Ce mois</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Types de Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    'Connaissement maritime (B/L)',
                    'Lettre de transport aérien (AWB)', 
                    'Facture commerciale',
                    'Liste de colisage',
                    'Certificat d\'origine',
                    'Déclaration en douane',
                    'Assurance transport',
                    'Licence d\'importation'
                  ].map((doc, index) => (
                    <div key={doc} className="flex justify-between items-center p-3 border rounded">
                      <span className="text-sm font-medium">{doc}</span>
                      <Badge variant="outline">{Math.floor(Math.random() * 20) + 5} en cours</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Section Analytics */}
          {selectedTab === 'analytics' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Analytics et Performances</h3>
              
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Répartition par Transport</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center space-x-2">
                          <Ship size={14} />
                          <span>Maritime</span>
                        </span>
                        <span className="font-medium">65%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{width: '65%'}}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center space-x-2">
                          <Plane size={14} />
                          <span>Aérien</span>
                        </span>
                        <span className="font-medium">25%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-600" style={{width: '25%'}}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center space-x-2">
                          <Truck size={14} />
                          <span>Routier</span>
                        </span>
                        <span className="font-medium">10%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-600" style={{width: '10%'}}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Performances Mensuelles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">96.8%</div>
                      <p className="text-sm text-muted-foreground">Taux de livraison dans les délais</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-xl font-bold">{stats.delivered}</p>
                        <p className="text-xs text-muted-foreground">Livraisons réussies</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold">{stats.delayed}</p>
                        <p className="text-xs text-muted-foreground">Retards</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
