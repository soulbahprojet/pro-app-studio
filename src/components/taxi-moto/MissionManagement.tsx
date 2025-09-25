import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Bike, MapPin, Clock, DollarSign, Phone, Navigation, Search, Filter, Star, AlertTriangle } from "lucide-react";

const MissionManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const availableMissions = [
    {
      id: 1,
      client: "Mamadou Diallo",
      phone: "+224 123 456 789",
      from: "Sandervalia",
      fromCoords: "9.5092, -13.7122",
      to: "Kaloum",
      toCoords: "9.5380, -13.6773",
      distance: "5.2 km",
      duration: "15 min",
      price: "25,000 GNF",
      priority: "normal",
      vehicleType: "moto",
      requestedAt: "14:30",
      clientRating: 4.5
    },
    {
      id: 2,
      client: "Fatoumata Camara",
      phone: "+224 987 654 321",
      from: "Ratoma",
      fromCoords: "9.5745, -13.6486",
      to: "Dixinn",
      toCoords: "9.5380, -13.6773",
      distance: "8.1 km",
      duration: "25 min",
      price: "35,000 GNF",
      priority: "express",
      vehicleType: "voiture",
      requestedAt: "14:45",
      clientRating: 4.8
    },
    {
      id: 3,
      client: "Alpha Barry",
      phone: "+224 555 777 888",
      from: "Matoto",
      fromCoords: "9.5092, -13.7122",
      to: "Hamdallaye",
      toCoords: "9.5380, -13.6773",
      distance: "12.3 km",
      duration: "35 min",
      price: "45,000 GNF",
      priority: "normal",
      vehicleType: "voiture",
      requestedAt: "15:00",
      clientRating: 4.2
    }
  ];

  const acceptedMissions = [
    {
      id: 4,
      client: "Mariama Bah",
      phone: "+224 111 222 333",
      from: "Kipé",
      to: "Almamya",
      status: "en_route_pickup",
      estimatedPickup: "16:15",
      price: "30,000 GNF"
    }
  ];

  const completedMissions = [
    {
      id: 5,
      client: "Ibrahima Sow",
      from: "Conakry Centre",
      to: "Camayenne",
      completedAt: "13:45",
      price: "28,000 GNF",
      rating: 5,
      tip: "2,000 GNF"
    },
    {
      id: 6,
      client: "Aissatou Dieng",
      from: "Kaloum",
      to: "Ratoma",
      completedAt: "12:30",
      price: "40,000 GNF",
      rating: 4,
      tip: "0 GNF"
    }
  ];

  const handleAcceptMission = (missionId: number) => {
    console.log('Mission acceptée:', missionId);
  };

  const handleRejectMission = (missionId: number) => {
    console.log('Mission refusée:', missionId);
  };

  const handleStartNavigation = (mission: any) => {
    console.log('Navigation vers:', mission.fromCoords);
  };

  const handleContactClient = (phone: string) => {
    console.log('Contacter client:', phone);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par client, adresse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
              >
                Toutes
              </Button>
              <Button
                variant={selectedFilter === 'moto' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('moto')}
              >
                Moto
              </Button>
              <Button
                variant={selectedFilter === 'voiture' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('voiture')}
              >
                Voiture
              </Button>
              <Button
                variant={selectedFilter === 'express' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('express')}
              >
                Express
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available" className="flex items-center gap-2">
            <Bike className="h-4 w-4" />
            Disponibles ({availableMissions.length})
          </TabsTrigger>
          <TabsTrigger value="accepted" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Acceptées ({acceptedMissions.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Terminées ({completedMissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-6">
          <div className="space-y-4">
            {availableMissions.map((mission) => (
              <Card key={mission.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Bike className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-lg">{mission.client}</p>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-muted-foreground">{mission.clientRating}/5</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {mission.priority === "express" && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Express
                        </Badge>
                      )}
                      <Badge variant="outline">{mission.vehicleType}</Badge>
                      <Badge variant="secondary">{mission.requestedAt}</Badge>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Départ:</span>
                      <span className="text-sm">{mission.from}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Arrivée:</span>
                      <span className="text-sm">{mission.to}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1">
                        <Navigation className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{mission.distance}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{mission.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-lg text-green-600">{mission.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContactClient(mission.phone)}
                      className="flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Contacter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartNavigation(mission)}
                      className="flex items-center gap-2"
                    >
                      <Navigation className="h-4 w-4" />
                      Localiser
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectMission(mission.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Refuser
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAcceptMission(mission.id)}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      Accepter la mission
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="accepted" className="mt-6">
          <div className="space-y-4">
            {acceptedMissions.map((mission) => (
              <Card key={mission.id} className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-lg">{mission.client}</p>
                      <p className="text-sm text-muted-foreground">Mission acceptée</p>
                    </div>
                    <Badge className="bg-blue-600">En cours</Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{mission.from} → {mission.to}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Arrivée prévue: {mission.estimatedPickup}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContactClient(mission.phone)}
                      className="flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Contacter
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Navigation GPS
                    </Button>
                    <Button size="sm" variant="outline">
                      Marquer comme terminée
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="space-y-4">
            {completedMissions.map((mission) => (
              <Card key={mission.id} className="border-green-200 bg-green-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-lg">{mission.client}</p>
                      <p className="text-sm text-muted-foreground">Terminée à {mission.completedAt}</p>
                    </div>
                    <Badge className="bg-green-600">Terminée</Badge>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{mission.from} → {mission.to}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{mission.price}</span>
                      </div>
                      {mission.tip !== "0 GNF" && (
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">Pourboire:</span>
                          <span className="text-sm font-medium text-green-600">{mission.tip}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < mission.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MissionManagement;
