import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { 
  Car, 
  Bike, 
  Truck, 
  MapPin, 
  Navigation, 
  Clock, 
  DollarSign, 
  Star, 
  MessageSquare, 
  Phone, 
  Settings, 
  BarChart3,
  History,
  User,
  CreditCard,
  Bell,
  Wifi,
  Battery,
  Shield,
  Download,
  FileText,
  LogOut
} from "lucide-react";
import DriverOnboarding from './DriverOnboarding';
import LiveMissions from './LiveMissions';
import DriverCommunication from './DriverCommunication';
import PaymentManagement from './PaymentManagement';
import DriverProfileManagement from './DriverProfileManagement';
import DriverStatistics from './DriverStatistics';
import RideHistory from './RideHistory';
import OfflineManager from './OfflineManager';

interface UberStyleInterfaceProps {
  onClose?: () => void;
}

const UberStyleInterface: React.FC<UberStyleInterfaceProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [driverStatus, setDriverStatus] = useState<"online" | "offline" | "busy">("offline");
  const [currentMission, setCurrentMission] = useState<any>(null);

  // Fonction pour fermer l'interface
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // Fallback: retourner à la page précédente ou fermer la modale
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
    }
  };

  const handleStatusChange = (newStatus: "online" | "offline" | "busy") => {
    setDriverStatus(newStatus);
  };

  const handleNavigation = (destination: string) => {
    if (!destination) {
      // Si pas de destination spécifique, utiliser une destination par défaut
      destination = "Conakry, Guinée";
    }
    
    // Ouvrir Google Maps avec la destination
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
    
    // Essayer d'ouvrir l'application Maps native en premier, puis fallback vers Google Maps web
    const mapsAppUrl = `maps://maps.google.com/maps?daddr=${encodeURIComponent(destination)}`;
    
    try {
      // Tentative d'ouverture de l'app native
      window.location.href = mapsAppUrl;
      
      // Fallback vers Google Maps web après un délai
      setTimeout(() => {
        window.open(googleMapsUrl, '_blank');
      }, 1000);
    } catch (error) {
      // Fallback direct vers Google Maps web
      window.open(googleMapsUrl, '_blank');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'En ligne';
      case 'busy': return 'Occupé';
      default: return 'Hors ligne';
    }
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto p-4 h-full">
        {/* Modern Header */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Moto Pro Guinée
              </h1>
              <p className="text-muted-foreground text-sm">
                Plateforme de livraison guinéenne
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wifi className="h-4 w-4 text-green-500" />
              <Battery className="h-4 w-4 text-green-500" />
              <Shield className="h-4 w-4 text-green-500" />
            </div>
            
            {/* Driver Status */}
            <Button
              onClick={() => handleStatusChange(driverStatus === 'online' ? 'offline' : 'online')}
              className={`${getStatusColor(driverStatus)} hover:opacity-80 text-white px-6 py-2 rounded-full transition-all duration-300`}
            >
              <div className={`w-2 h-2 rounded-full bg-white mr-2 ${driverStatus === 'online' ? 'animate-pulse' : ''}`} />
              {getStatusText(driverStatus)}
            </Button>
            
            {/* Notifications */}
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">3</span>
              </div>
            </Button>
            
            {/* Exit Button */}
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleClose}
              className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
              title="Quitter"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Current Mission Alert */}
        {currentMission && (
          <Card className="mb-6 border-primary bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  <div>
                    <p className="font-medium">Mission en cours</p>
                    <p className="text-sm text-muted-foreground">
                      {currentMission.client} • {currentMission.destination}
                    </p>
                  </div>
                </div>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => handleNavigation(currentMission?.destination)}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Navigation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-6 bg-white rounded-xl p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Tableau de bord</span>
            </TabsTrigger>
            <TabsTrigger value="missions" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Missions</span>
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Paiements</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Historique</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Statistiques</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="offline" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Hors ligne</span>
            </TabsTrigger>
          </TabsList>

          <div className="h-[calc(100vh-240px)] overflow-auto">
            <TabsContent value="dashboard" className="mt-0">
              <LiveMissions 
                driverStatus={driverStatus}
                onStatusChange={handleStatusChange}
                onMissionAccept={setCurrentMission}
              />
            </TabsContent>

            <TabsContent value="missions" className="mt-0">
              <LiveMissions 
                driverStatus={driverStatus}
                onStatusChange={handleStatusChange}
                onMissionAccept={setCurrentMission}
                fullView={true}
              />
            </TabsContent>

            <TabsContent value="communication" className="mt-0">
              <DriverCommunication />
            </TabsContent>

            <TabsContent value="payment" className="mt-0">
              <PaymentManagement />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <RideHistory />
            </TabsContent>

            <TabsContent value="stats" className="mt-0">
              <DriverStatistics />
            </TabsContent>

            <TabsContent value="profile" className="mt-0">
              <DriverProfileManagement />
            </TabsContent>

            <TabsContent value="offline" className="mt-0">
              <OfflineManager />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default UberStyleInterface;
