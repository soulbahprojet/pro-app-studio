import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Users, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  TrendingUp,
  Shield,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  UserCheck,
  UserX,
  Bell,
  Calendar,
  MapPin,
  Phone
} from 'lucide-react';

interface Worker {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  motorcycleId: string;
  zone: string;
  status: 'active' | 'suspended' | 'pending' | 'inactive';
  joinDate: string;
  lastActivity: string;
  violations: number;
  rating: number;
}

interface Alert {
  id: string;
  type: 'violation' | 'emergency' | 'license' | 'payment';
  title: string;
  description: string;
  workerId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  resolved: boolean;
}

interface SyndicatStats {
  totalWorkers: number;
  activeWorkers: number;
  pendingApplications: number;
  suspendedWorkers: number;
  totalRevenue: number;
  monthlyFees: number;
  openAlerts: number;
  resolvedToday: number;
}

export default function SyndicatBureau() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'workers' | 'alerts' | 'reports' | 'finances'>('workers');
  const [selectedWorkerStatus, setSelectedWorkerStatus] = useState<string>('all');

  const [stats, setStats] = useState<SyndicatStats>({
    totalWorkers: 1247,
    activeWorkers: 1089,
    pendingApplications: 23,
    suspendedWorkers: 15,
    totalRevenue: 18750000,
    monthlyFees: 2500000,
    openAlerts: 7,
    resolvedToday: 12
  });

  const [workers, setWorkers] = useState<Worker[]>([
    {
      id: 'MTX-001',
      name: 'Mamadou Diallo',
      phone: '+221 77 123 4567',
      licenseNumber: 'LIC-2024-001',
      motorcycleId: 'MOTO-DK-1234',
      zone: 'Plateau',
      status: 'active',
      joinDate: '2024-01-15',
      lastActivity: '2024-01-20 14:30',
      violations: 0,
      rating: 4.8
    },
    {
      id: 'MTX-002',
      name: 'Ibrahima Fall',
      phone: '+221 70 987 6543',
      licenseNumber: 'LIC-2024-002',
      motorcycleId: 'MOTO-DK-5678',
      zone: 'Almadies',
      status: 'suspended',
      joinDate: '2023-12-01',
      lastActivity: '2024-01-18 09:15',
      violations: 3,
      rating: 3.2
    },
    {
      id: 'MTX-003',
      name: 'Ousmane Ba',
      phone: '+221 76 456 7890',
      licenseNumber: 'PENDING',
      motorcycleId: 'MOTO-DK-9012',
      zone: 'Sacré-Coeur',
      status: 'pending',
      joinDate: '2024-01-20',
      lastActivity: 'N/A',
      violations: 0,
      rating: 0
    }
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 'ALT-001',
      type: 'violation',
      title: 'Violation de zone',
      description: 'Conduite hors zone autorisée - Plateau vers Pikine',
      workerId: 'MTX-002',
      priority: 'high',
      timestamp: '2024-01-20 15:45',
      resolved: false
    },
    {
      id: 'ALT-002',
      type: 'emergency',
      title: 'Signal de détresse',
      description: 'Signal d\'urgence activé - Position: Corniche',
      workerId: 'MTX-004',
      priority: 'critical',
      timestamp: '2024-01-20 16:12',
      resolved: false
    },
    {
      id: 'ALT-003',
      type: 'license',
      title: 'Licence expirée',
      description: 'Licence expire dans 7 jours',
      workerId: 'MTX-005',
      priority: 'medium',
      timestamp: '2024-01-20 10:00',
      resolved: false
    }
  ]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, text: 'Actif', color: 'bg-green-100 text-green-700' },
      suspended: { variant: 'destructive' as const, text: 'Suspendu', color: 'bg-red-100 text-red-700' },
      pending: { variant: 'outline' as const, text: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
      inactive: { variant: 'secondary' as const, text: 'Inactif', color: 'bg-gray-100 text-gray-700' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-700',
      medium: 'bg-yellow-100 text-yellow-700', 
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700'
    };
    
    return (
      <Badge className={colors[priority as keyof typeof colors]}>
        {priority === 'critical' ? '🚨 Critique' : 
         priority === 'high' ? '⚠️ Élevée' :
         priority === 'medium' ? '📋 Moyenne' : '📝 Faible'}
      </Badge>
    );
  };

  const updateWorkerStatus = (workerId: string, newStatus: string) => {
    setWorkers(workers.map(worker => 
      worker.id === workerId ? { ...worker, status: newStatus as any } : worker
    ));
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.motorcycleId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedWorkerStatus === 'all' || worker.status === selectedWorkerStatus;
    return matchesSearch && matchesStatus;
  });

  const activeAlerts = alerts.filter(alert => !alert.resolved);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <Building2 className="text-blue-600" size={32} />
          <h1 className="text-4xl font-bold">Bureau du Syndicat</h1>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-600 font-medium">Système opérationnel</span>
          </div>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Administration et supervision des moto-taxis de Dakar
        </p>
        <div className="flex justify-center items-center space-x-8 text-sm">
          <div className="flex items-center space-x-2">
            <Users className="text-blue-600" size={16} />
            <span>{stats.activeWorkers} chauffeurs actifs</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-orange-600" size={16} />
            <span>{stats.openAlerts} alertes ouvertes</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-600" size={16} />
            <span>{stats.resolvedToday} résolues aujourd'hui</span>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chauffeurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeWorkers} actifs • {stats.pendingApplications} en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Mensuels</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.monthlyFees / 1000000).toFixed(1)}M CFA</div>
            <p className="text-xs text-green-600">
              +12% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes Actives</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openAlerts}</div>
            <p className="text-xs text-orange-600">
              {activeAlerts.filter(a => a.priority === 'critical').length} critiques
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformité</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-green-600">
              Taux de conformité général
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation par onglets */}
      <Card>
        <CardHeader>
          <div className="flex space-x-1">
            {[
              { id: 'workers', label: 'Chauffeurs', icon: <Users size={16} /> },
              { id: 'alerts', label: 'Alertes', icon: <AlertTriangle size={16} /> },
              { id: 'reports', label: 'Rapports', icon: <FileText size={16} /> },
              { id: 'finances', label: 'Finances', icon: <BarChart3 size={16} /> }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={selectedTab === tab.id ? "default" : "ghost"}
                onClick={() => setSelectedTab(tab.id as any)}
                className="flex items-center space-x-2"
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.id === 'alerts' && activeAlerts.length > 0 && (
                  <Badge className="bg-red-500 text-white ml-2">{activeAlerts.length}</Badge>
                )}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {/* Section Chauffeurs */}
          {selectedTab === 'workers' && (
            <div className="space-y-4">
              {/* Filtres et recherche */}
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    placeholder="Rechercher par nom, licence, moto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select 
                  value={selectedWorkerStatus}
                  onChange={(e) => setSelectedWorkerStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="suspended">Suspendus</option>
                  <option value="pending">En attente</option>
                  <option value="inactive">Inactifs</option>
                </select>
                <Button variant="outline">
                  <Download size={16} className="mr-2" />
                  Exporter
                </Button>
              </div>

              {/* Liste des chauffeurs */}
              <div className="space-y-4">
                {filteredWorkers.map((worker) => (
                  <div key={worker.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold">{worker.name}</h3>
                          {getStatusBadge(worker.status)}
                          {worker.violations > 0 && (
                            <Badge className="bg-orange-100 text-orange-700">
                              {worker.violations} violation{worker.violations > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Phone size={14} />
                            <span>{worker.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FileText size={14} />
                            <span>{worker.licenseNumber}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin size={14} />
                            <span>Zone {worker.zone}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Moto: {worker.motorcycleId}</span>
                          <span>Inscrit: {worker.joinDate}</span>
                          <span>Dernière activité: {worker.lastActivity}</span>
                          {worker.rating > 0 && <span>Note: {worker.rating}/5</span>}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye size={14} className="mr-1" />
                          Voir
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit size={14} className="mr-1" />
                          Modifier
                        </Button>
                        {worker.status === 'active' ? (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => updateWorkerStatus(worker.id, 'suspended')}
                          >
                            <UserX size={14} className="mr-1" />
                            Suspendre
                          </Button>
                        ) : worker.status === 'suspended' ? (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => updateWorkerStatus(worker.id, 'active')}
                          >
                            <UserCheck size={14} className="mr-1" />
                            Réactiver
                          </Button>
                        ) : worker.status === 'pending' ? (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => updateWorkerStatus(worker.id, 'active')}
                          >
                            <UserCheck size={14} className="mr-1" />
                            Approuver
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section Alertes */}
          {selectedTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Alertes en cours ({activeAlerts.length})</h3>
                <Button variant="outline">
                  <Bell size={16} className="mr-2" />
                  Marquer tout comme lu
                </Button>
              </div>
              
              <div className="space-y-3">
                {activeAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium">{alert.title}</h4>
                          {getPriorityBadge(alert.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>ID: {alert.id}</span>
                          {alert.workerId && <span>Chauffeur: {alert.workerId}</span>}
                          <span>{alert.timestamp}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye size={14} className="mr-1" />
                          Détails
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Résoudre
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section Rapports */}
          {selectedTab === 'reports' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rapports et Statistiques</h3>
              
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Activité Mensuelle</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Nouvelles inscriptions</span>
                        <span className="font-medium">23</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{width: '65%'}}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Violations traitées</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-600" style={{width: '40%'}}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Renouvellements licence</span>
                        <span className="font-medium">87</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-600" style={{width: '90%'}}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Zones d'Activité</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {['Plateau', 'Almadies', 'Sacré-Coeur', 'Pikine', 'Guédiawaye'].map((zone, index) => (
                      <div key={zone} className="flex justify-between items-center">
                        <span className="text-sm">{zone}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600" 
                              style={{width: `${85 - index * 10}%`}}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground">{85 - index * 10}%</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Section Finances */}
          {selectedTab === 'finances' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Gestion Financière</h3>
              
              <div className="grid lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Revenus ce Mois</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(stats.monthlyFees / 1000000).toFixed(1)}M CFA</div>
                    <p className="text-xs text-green-600">+12% vs mois dernier</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Cotisations Payées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">94%</div>
                    <p className="text-xs text-muted-foreground">1,172 sur 1,247 chauffeurs</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Retards de Paiement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">75</div>
                    <p className="text-xs text-orange-600">À relancer</p>
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