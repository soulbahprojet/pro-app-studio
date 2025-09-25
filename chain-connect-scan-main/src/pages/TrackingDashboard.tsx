import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Home, ChevronRight, Map, Navigation2, Users, Zap, MapPin, Truck, Package, Globe, Clock, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import RealtimeTrackingMap from '@/components/RealtimeTrackingMap';
import CourierMapInterface from '@/components/maps/CourierMapInterface';
import TaxiMotoMapInterface from '@/components/maps/TaxiMotoMapInterface';
import FreightMapInterface from '@/components/maps/FreightMapInterface';
import ServicesMap from '@/components/maps/ServicesMap';
import FreightInterface from '@/components/freight/FreightInterface';

const TrackingDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('realtime');
  const [loading, setLoading] = useState(false);

  console.log('TrackingDashboard - User:', user);
  console.log('TrackingDashboard - Current route: /tracking');

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb Navigation */}
      <div className="px-4 py-4">
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">GPS Tracking</span>
        </nav>
      </div>

      {/* Hero Section */}
      <div className="px-4 pb-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tableau de Bord GPS
            </h1>
            <p className="text-muted-foreground mt-2">
              Suivez tous vos services en temps réel sur une carte interactive
            </p>
          </div>
        </div>
      </div>

      {/* Services de Logistique Disponibles */}
      <div className="px-4 pb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-center mb-2">Services de Logistique Disponibles</h2>
          <p className="text-center text-muted-foreground">Choisissez le service qui correspond à vos besoins</p>
        </div>
        
        <div className="flex justify-center">
          <div className="max-w-2xl w-full">
            {/* Service Transitaire International Ultra-Professionnel */}
            <Dialog>
              <DialogTrigger asChild>
                <Card className="hover:shadow-2xl transition-all duration-500 cursor-pointer border-green-200 hover:border-green-400 hover:scale-105 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      {/* Header avec logo et titre */}
                      <div className="text-center space-y-4">
                        <div className="w-24 h-24 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                          <Globe className="w-12 h-12 text-white" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            🌍 TRANSITAIRE INTERNATIONAL PRO
                          </h2>
                          <p className="text-lg text-muted-foreground mt-2 font-medium">
                            Solution logistique complète inspirée DHL & Amazon
                          </p>
                        </div>
                      </div>

                      {/* Fonctionnalités principales */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/80 rounded-lg p-4 border border-green-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-green-700">Suivi Temps Réel</span>
                          </div>
                          <ul className="text-sm text-green-600 space-y-1">
                            <li>• GPS tracking 10-15s</li>
                            <li>• Mapbox Pro intégré</li>
                            <li>• Polyline optimisée</li>
                            <li>• SLA dynamique</li>
                          </ul>
                        </div>

                        <div className="bg-white/80 rounded-lg p-4 border border-emerald-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Truck className="w-5 h-5 text-emerald-600" />
                            <span className="font-semibold text-emerald-700">Multi-Transporteurs</span>
                          </div>
                          <ul className="text-sm text-emerald-600 space-y-1">
                            <li>• Attribution automatique</li>
                            <li>• Comparaison coûts/délais</li>
                            <li>• Performance analytics</li>
                            <li>• Optimisation routes</li>
                          </ul>
                        </div>

                        <div className="bg-white/80 rounded-lg p-4 border border-teal-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-teal-600" />
                            <span className="font-semibold text-teal-700">Gestion Priorités</span>
                          </div>
                          <ul className="text-sm text-teal-600 space-y-1">
                            <li>• Express/Standard/Fragile</li>
                            <li>• SLA temps réel</li>
                            <li>• Alertes automatiques</li>
                            <li>• Escalation incidents</li>
                          </ul>
                        </div>

                        <div className="bg-white/80 rounded-lg p-4 border border-blue-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-blue-700">IA & Analytics</span>
                          </div>
                          <ul className="text-sm text-blue-600 space-y-1">
                            <li>• OpenAI monitoring</li>
                            <li>• Détection anomalies</li>
                            <li>• Prédictions retards</li>
                            <li>• Rapports intelligents</li>
                          </ul>
                        </div>
                      </div>

                      {/* Services avancés */}
                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4">
                        <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          Services Professionnels Intégrés
                        </h4>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <span className="bg-white/70 px-2 py-1 rounded text-green-700">📋 Documents Douane</span>
                          <span className="bg-white/70 px-2 py-1 rounded text-green-700">💳 Paiements Sécurisés</span>
                          <span className="bg-white/70 px-2 py-1 rounded text-green-700">📱 Notifications Push</span>
                          <span className="bg-white/70 px-2 py-1 rounded text-green-700">🔒 Assurance Intégrée</span>
                          <span className="bg-white/70 px-2 py-1 rounded text-green-700">📊 Dashboard Admin</span>
                          <span className="bg-white/70 px-2 py-1 rounded text-green-700">🎯 Optimisation IA</span>
                        </div>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-7xl h-[90vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    Interface Transitaire International Professionnelle
                  </DialogTitle>
                </DialogHeader>
                <div className="h-full overflow-auto">
                  <FreightInterface />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200 cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={() => {
              toast({
                title: "🌍 Transitaires Internationaux",
                description: "Accès à la liste des transitaires disponibles"
              });
              // Ici on pourrait ouvrir une modal ou naviguer vers une liste de transitaires
            }}
          >
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Globe className="w-6 h-6 text-green-600 mr-2" />
                <div className="text-2xl font-bold text-green-600">International</div>
              </div>
              <p className="text-sm text-green-500">Voir Autres Transitaires</p>
              <div className="mt-2 flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200 cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={async () => {
              try {
                // Récupérer le pays de l'utilisateur connecté
                const { data: currentUser, error: userError } = await supabase
                  .from('profiles')
                  .select('country')
                  .eq('user_id', user?.id)
                  .single();

                if (userError) throw userError;

                const userCountry = currentUser?.country;

                if (!userCountry) {
                  toast({
                    title: "❌ Pays non défini",
                    description: "Veuillez mettre à jour votre profil avec votre pays",
                    variant: "destructive"
                  });
                  return;
                }
                
                // Récupérer tous les transitaires du même pays
                const { data: forwarders, error } = await supabase
                  .from('freight_forwarder_profiles')
                  .select(`
                    id,
                    company_name,
                    country,
                    city,
                    phone,
                    email,
                    is_active,
                    is_verified
                  `)
                  .eq('country', userCountry)
                  .eq('is_active', true)
                  .eq('is_verified', true)
                  .order('company_name', { ascending: true });

                if (error) throw error;

                // Afficher la liste de tous les transitaires du pays
                const forwardersList = forwarders?.map((f, index) => 
                  `${index + 1}. ${f.company_name} - ${f.city} 📞 ${f.phone}`
                ).join('\n') || "Aucun transitaire trouvé dans votre pays";

                toast({
                  title: `🌍 Tous les Transitaires - ${userCountry}`,
                  description: forwardersList,
                  duration: 10000
                });

              } catch (error) {
                toast({
                  title: "❌ Erreur",
                  description: "Impossible de charger les transitaires du pays",
                  variant: "destructive"
                });
              }
            }}
          >
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-green-600 mr-2" />
                <div className="text-2xl font-bold text-green-600">Livreurs</div>
              </div>
              <p className="text-sm text-green-500">Livreur de mon pays</p>
              <div className="mt-2 flex items-center justify-center">
                <Globe className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-xs text-green-600">Uniquement mon pays</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Bouton Temps Réel - Visible dans les pays avec services taxi-moto */}
          {['GN', 'CI', 'SN', 'ML', 'BF', 'SL', 'GH', 'NG', 'BJ', 'TG', 'LR'].includes(profile?.country || '') && (
            <Card 
              className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200 cursor-pointer transition-all duration-300 hover:shadow-lg"
              onClick={async () => {
                try {
                  // Récupérer la position de l'utilisateur
                  navigator.geolocation.getCurrentPosition(async (position) => {
                    const userLat = position.coords.latitude;
                    const userLon = position.coords.longitude;
                    
                    // Récupérer tous les livreurs et taxi-moto
                    const { data: couriers, error } = await supabase
                      .from('profiles')
                      .select(`
                        user_id,
                        full_name,
                        role,
                        country,
                        address,
                        phone,
                        vehicle_type,
                        vest_number,
                        is_verified,
                        gps_verified
                      `)
                      .in('role', ['courier', 'taxi_moto'])
                      .eq('is_verified', true)
                      .eq('gps_verified', true);

                    if (error) throw error;

                    // Grouper par type et trier par proximité simulée
                    const couriersList = couriers?.filter(c => c.role === 'courier') || [];
                    const taxiMotoList = couriers?.filter(c => c.role === 'taxi_moto') || [];
                    
                    // Trier par pays puis adresse pour simuler la proximité
                    const sortByProximity = (a, b) => {
                      if (a.country === b.country) {
                        return a.address?.localeCompare(b.address || '') || 0;
                      }
                      return a.country?.localeCompare(b.country || '') || 0;
                    };

                    couriersList.sort(sortByProximity);
                    taxiMotoList.sort(sortByProximity);

                    // Créer la liste d'affichage
                    let displayList = "";
                    
                    if (couriersList.length > 0) {
                      displayList += "🚚 LIVREURS:\n";
                      couriersList.slice(0, 3).forEach((c, index) => {
                        displayList += `${index + 1}. ${c.full_name} (${c.vest_number}) - ${c.address}, ${c.country}\n`;
                      });
                    }
                    
                    if (taxiMotoList.length > 0) {
                      displayList += "\n🏍️ TAXI-MOTO:\n";
                      taxiMotoList.slice(0, 3).forEach((t, index) => {
                        displayList += `${index + 1}. ${t.full_name} (${t.vest_number}) - ${t.address}, ${t.country}\n`;
                      });
                    }

                    if (!displayList) {
                      displayList = "Aucun livreur ou taxi-moto disponible dans votre zone";
                    }

                    toast({
                      title: "🚚🏍️ Livreurs & Taxi-Moto Disponibles",
                      description: displayList,
                      duration: 10000
                    });
                    
                  }, (error) => {
                    toast({
                      title: "📍 Géolocalisation indisponible", 
                      description: "Affichage des livreurs par ordre alphabétique",
                      variant: "destructive"
                    });
                  });
                } catch (error) {
                  toast({
                    title: "❌ Erreur",
                    description: "Impossible de charger les livreurs",
                    variant: "destructive"
                  });
                }
              }}
            >
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Truck className="w-6 h-6 text-purple-600 mr-2" />
                  <div className="text-2xl font-bold text-purple-600">Temps Réel</div>
                </div>
                <p className="text-sm text-purple-500">Livreurs & Taxi-Moto</p>
                <div className="mt-2 flex items-center justify-center">
                  <Navigation2 className="w-4 h-4 text-purple-600 mr-1" />
                  <span className="text-xs text-purple-600">Par proximité</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>


      {/* Bottom spacing for navigation */}
      <div className="h-24"></div>
    </div>
  );
};

export default TrackingDashboard;