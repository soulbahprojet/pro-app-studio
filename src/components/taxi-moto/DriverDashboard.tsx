import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Bike, MapPin, Clock, DollarSign, Star, AlertTriangle, Bell, Navigation, Battery, Wifi } from "lucide-react";

interface DriverDashboardProps {
  driverStatus: "active" | "inactive" | "pause";
  setDriverStatus: (status: "active" | "inactive" | "pause") => void;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ driverStatus, setDriverStatus }) => {
  const missions = [
    {
      id: 1,
      client: "Mamadou Diallo",
      from: "Sandervalia",
      to: "Kaloum",
      distance: "5.2 km",
      price: "25,000 GNF",
      priority: "normal",
      vehicleType: "moto"
    },
    {
      id: 2,
      client: "Fatoumata Camara",
      from: "Ratoma",
      to: "Dixinn",
      distance: "8.1 km",
      price: "35,000 GNF",
      priority: "express",
      vehicleType: "voiture"
    }
  ];

  const todayStats = {
    completedRides: 12,
    earnings: "285,000",
    rating: 4.8,
    hoursWorked: 8.5
  };

  return (
    <div className="space-y-6">
      {/* Status Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bike className="h-5 w-5" />
              Statut du conducteur
            </span>
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-green-500" />
              <Battery className="h-4 w-4 text-green-500" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="active-mode"
                  checked={driverStatus === "active"}
                  onCheckedChange={(checked) => setDriverStatus(checked ? "active" : "inactive")}
                />
                <Label htmlFor="active-mode">Mode actif</Label>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={driverStatus === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDriverStatus("active")}
                >
                  🟢 En ligne
                </Button>
                <Button
                  variant={driverStatus === "pause" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDriverStatus("pause")}
                >
                  🟡 Pause
                </Button>
                <Button
                  variant={driverStatus === "inactive" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDriverStatus("inactive")}
                >
                  🔴 Hors ligne
                </Button>
              </div>
            </div>
            <Badge variant={driverStatus === 'active' ? 'default' : driverStatus === 'pause' ? 'secondary' : 'outline'} className="text-lg p-2">
              {driverStatus === 'active' ? 'DISPONIBLE' : driverStatus === 'pause' ? 'EN PAUSE' : 'HORS LIGNE'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Courses</p>
                <p className="text-2xl font-bold">{todayStats.completedRides}</p>
              </div>
              <Bike className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus</p>
                <p className="text-2xl font-bold">{todayStats.earnings} GNF</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Évaluation</p>
                <p className="text-2xl font-bold">{todayStats.rating}/5</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Heures</p>
                <p className="text-2xl font-bold">{todayStats.hoursWorked}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Missions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Missions disponibles
            </span>
            <Badge variant="secondary">{missions.length} en attente</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {missions.map((mission) => (
              <div key={mission.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Bike className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{mission.client}</p>
                      <p className="text-sm text-muted-foreground">Client</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {mission.priority === "express" && (
                      <Badge variant="destructive">Express</Badge>
                    )}
                    <Badge variant="outline">{mission.vehicleType}</Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{mission.from}</span>
                  <Navigation className="h-4 w-4 text-muted-foreground" />
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span className="text-sm">{mission.to}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{mission.distance}</span>
                    <span className="font-medium text-lg text-green-600">{mission.price}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Refuser
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Accepter
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {missions.length === 0 && (
            <div className="text-center py-8">
              <Bike className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune mission disponible pour le moment</p>
              <p className="text-sm text-muted-foreground mt-2">
                Assurez-vous d'être en mode actif pour recevoir des demandes
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Mission (if any) */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Navigation className="h-5 w-5" />
            Mission en cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">Aminata Touré</p>
              <p className="text-sm text-muted-foreground">Course vers Kaloum</p>
            </div>
            <Badge className="bg-blue-600">En cours</Badge>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-green-500" />
            <span className="text-sm">Position actuelle</span>
            <Navigation className="h-4 w-4 text-muted-foreground" />
            <MapPin className="h-4 w-4 text-red-500" />
            <span className="text-sm">Destination</span>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              Contacter client
            </Button>
            <Button className="flex-1 bg-green-600 hover:bg-green-700">
              Terminer course
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverDashboard;
