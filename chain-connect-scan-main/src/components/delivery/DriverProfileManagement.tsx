import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Car, 
  FileText, 
  Settings, 
  Bell, 
  Shield,
  Star,
  Upload,
  Edit,
  CheckCircle,
  AlertTriangle,
  Camera
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const DriverProfileManagement: React.FC = () => {
  const [profileData, setProfileData] = useState({
    firstName: 'Mamadou',
    lastName: 'Diallo',
    email: 'mamadou.diallo@email.com',
    phone: '+224 123 456 789',
    city: 'Conakry',
    address: 'Sandervalia, Conakry',
    dateOfBirth: '1990-05-15',
    emergencyContact: 'Fatoumata Diallo',
    emergencyPhone: '+224 987 654 321'
  });

  const [vehicleData, setVehicleData] = useState({
    type: 'moto',
    brand: 'Honda',
    model: 'CG 125',
    year: '2020',
    color: 'Rouge',
    licensePlate: 'CN-4567-AB'
  });

  const [notifications, setNotifications] = useState({
    newMissions: true,
    missionUpdates: true,
    payments: true,
    promotions: false,
    systemUpdates: true
  });

  const { toast } = useToast();

  const documents = [
    {
      type: 'identity',
      name: 'Pièce d\'identité',
      status: 'verified',
      expiryDate: '2029-12-31',
      uploadedDate: '2024-01-15'
    },
    {
      type: 'license',
      name: 'Permis de conduire',
      status: 'verified',
      expiryDate: '2027-08-20',
      uploadedDate: '2024-01-15'
    },
    {
      type: 'insurance',
      name: 'Assurance véhicule',
      status: 'expires_soon',
      expiryDate: '2024-03-15',
      uploadedDate: '2024-01-15'
    },
    {
      type: 'registration',
      name: 'Carte grise',
      status: 'verified',
      expiryDate: '2026-12-31',
      uploadedDate: '2024-01-15'
    }
  ];

  const driverStats = {
    rating: 4.8,
    totalRides: 1247,
    totalEarnings: '12,450,000',
    memberSince: '2024-01-15',
    badges: ['Conducteur fiable', 'Service client excellent', '1000+ courses']
  };

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expires_soon': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'expired': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDocumentStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'Vérifié';
      case 'expires_soon': return 'Expire bientôt';
      case 'expired': return 'Expiré';
      default: return 'En attente';
    }
  };

  const handleProfileUpdate = () => {
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été sauvegardées avec succès.",
    });
  };

  const handleDocumentUpload = (documentType: string) => {
    toast({
      title: "Document uploadé",
      description: `Le document ${documentType} a été uploadé avec succès.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/avatars/driver.jpg" />
                <AvatarFallback className="text-2xl">
                  {profileData.firstName[0]}{profileData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full p-2 h-8 w-8"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profileData.firstName} {profileData.lastName}</h2>
              <p className="text-muted-foreground">{profileData.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{driverStats.rating}</span>
                  <span className="text-sm text-muted-foreground">({driverStats.totalRides} courses)</span>
                </div>
                <Badge variant="outline">Conducteur vérifié</Badge>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{driverStats.totalEarnings}</p>
              <p className="text-sm text-muted-foreground">GNF gagnés</p>
              <p className="text-xs text-muted-foreground">Membre depuis {new Date(driverStats.memberSince).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Informations personnelles</TabsTrigger>
          <TabsTrigger value="vehicle">Véhicule</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={profileData.city}
                    onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date de naissance</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContact">Contact d'urgence</Label>
                  <Input
                    id="emergencyContact"
                    value={profileData.emergencyContact}
                    onChange={(e) => setProfileData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Téléphone d'urgence</Label>
                  <Input
                    id="emergencyPhone"
                    value={profileData.emergencyPhone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button onClick={handleProfileUpdate}>
                  Sauvegarder les modifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicle" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Informations du véhicule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicleType">Type de véhicule</Label>
                  <Input
                    id="vehicleType"
                    value={vehicleData.type}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, type: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicleBrand">Marque</Label>
                  <Input
                    id="vehicleBrand"
                    value={vehicleData.brand}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, brand: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicleModel">Modèle</Label>
                  <Input
                    id="vehicleModel"
                    value={vehicleData.model}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, model: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicleYear">Année</Label>
                  <Input
                    id="vehicleYear"
                    value={vehicleData.year}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, year: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicleColor">Couleur</Label>
                  <Input
                    id="vehicleColor"
                    value={vehicleData.color}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, color: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="licensePlate">Plaque d'immatriculation</Label>
                  <Input
                    id="licensePlate"
                    value={vehicleData.licensePlate}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, licensePlate: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button onClick={handleProfileUpdate}>
                  Sauvegarder les modifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents officiels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((document) => (
                  <div key={document.type} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getDocumentStatusIcon(document.status)}
                      <div>
                        <p className="font-medium">{document.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Expire le {new Date(document.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={document.status === 'verified' ? 'default' : 'secondary'}
                        className={
                          document.status === 'expires_soon' ? 'bg-yellow-100 text-yellow-800' :
                          document.status === 'expired' ? 'bg-red-100 text-red-800' : ''
                        }
                      >
                        {getDocumentStatusText(document.status)}
                      </Badge>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDocumentUpload(document.name)}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Renouveler
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="space-y-6">
            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Paramètres de notification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {key === 'newMissions' && 'Nouvelles missions'}
                        {key === 'missionUpdates' && 'Mises à jour des missions'}
                        {key === 'payments' && 'Notifications de paiement'}
                        {key === 'promotions' && 'Promotions et offres'}
                        {key === 'systemUpdates' && 'Mises à jour système'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {key === 'newMissions' && 'Recevoir des notifications pour les nouvelles demandes'}
                        {key === 'missionUpdates' && 'Être informé des changements de statut'}
                        {key === 'payments' && 'Notifications de revenus et paiements'}
                        {key === 'promotions' && 'Offres spéciales et bonus'}
                        {key === 'systemUpdates' && 'Mises à jour importantes de l\'application'}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, [key]: checked }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Confidentialité et sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Partage de localisation</p>
                    <p className="text-sm text-muted-foreground">
                      Permettre aux clients de voir votre position en temps réel
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Données d'utilisation</p>
                    <p className="text-sm text-muted-foreground">
                      Partager les données anonymes pour améliorer l'application
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Authentification à deux facteurs</p>
                    <p className="text-sm text-muted-foreground">
                      Sécurité renforcée pour votre compte
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DriverProfileManagement;