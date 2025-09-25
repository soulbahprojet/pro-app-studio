import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { User, Bike, FileText, Settings, Bell, Shield, MapPin, Upload, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DriverProfile: React.FC = () => {
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    firstName: 'Thierno',
    lastName: 'Souleymane Bah',
    phone: '+224 624 039 029',
    email: 'thierno.bah@email.com',
    address: 'Coyah, Guinée',
    emergencyContact: 'Fatoumata Bah',
    emergencyPhone: '+224 666 777 888',
    unionOffice: 'Bureau Conakry Centre',
    driverLicense: 'DL123456789',
    vehicleType: 'moto',
    vehicleBrand: 'Yamaha',
    vehicleModel: 'FZ 150',
    licensePlate: 'AB-123-CD',
    insuranceNumber: 'INS789456123'
  });

  const [settings, setSettings] = useState({
    notifications: {
      newMissions: true,
      paymentUpdates: true,
      systemAlerts: true,
      emergencyAlerts: true
    },
    privacy: {
      shareLocation: true,
      showOnlineStatus: true,
      allowDirectContact: true
    },
    preferences: {
      language: 'fr',
      currency: 'GNF',
      autoAcceptRadius: '5',
      workingHours: {
        start: '06:00',
        end: '22:00'
      }
    }
  });

  const handleProfileUpdate = () => {
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été sauvegardées avec succès",
    });
  };

  const handleSettingsUpdate = () => {
    toast({
      title: "Paramètres mis à jour",
      description: "Vos préférences ont été sauvegardées",
    });
  };

  const handleDocumentUpload = (documentType: string) => {
    toast({
      title: "Document téléchargé",
      description: `${documentType} mis à jour avec succès`,
    });
  };

  const requestUnionTransfer = () => {
    toast({
      title: "Demande de transfert",
      description: "Votre demande de transfert a été soumise",
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
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="text-2xl">TB</AvatarFallback>
              </Avatar>
              <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2">
                <Edit className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profileData.firstName} {profileData.lastName}</h2>
              <p className="text-muted-foreground">{profileData.phone}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="default">Conducteur Vérifié</Badge>
                <Badge variant="secondary">{profileData.vehicleType}</Badge>
                <Badge variant="outline">{profileData.unionOffice}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">4.8</div>
              <div className="text-sm text-muted-foreground">Note moyenne</div>
              <div className="text-sm text-muted-foreground">245 courses</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personnel
          </TabsTrigger>
          <TabsTrigger value="vehicle" className="flex items-center gap-2">
            <Bike className="h-4 w-4" />
            Véhicule
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Paramètres
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact">Contact d'urgence</Label>
                  <Input
                    id="emergencyContact"
                    value={profileData.emergencyContact}
                    onChange={(e) => setProfileData({...profileData, emergencyContact: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Téléphone d'urgence</Label>
                  <Input
                    id="emergencyPhone"
                    value={profileData.emergencyPhone}
                    onChange={(e) => setProfileData({...profileData, emergencyPhone: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleProfileUpdate}>
                Mettre à jour le profil
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Affiliation syndicale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="unionOffice">Bureau syndicat actuel</Label>
                <Select value={profileData.unionOffice} onValueChange={(value) => setProfileData({...profileData, unionOffice: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bureau Conakry Centre">Bureau Conakry Centre</SelectItem>
                    <SelectItem value="Bureau Kaloum">Bureau Kaloum</SelectItem>
                    <SelectItem value="Bureau Ratoma">Bureau Ratoma</SelectItem>
                    <SelectItem value="Bureau Matoto">Bureau Matoto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={requestUnionTransfer}>
                Demander un transfert de bureau
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations du véhicule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicleType">Type de véhicule</Label>
                  <Select value={profileData.vehicleType} onValueChange={(value) => setProfileData({...profileData, vehicleType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="moto">Moto</SelectItem>
                      <SelectItem value="voiture">Voiture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vehicleBrand">Marque</Label>
                  <Input
                    id="vehicleBrand"
                    value={profileData.vehicleBrand}
                    onChange={(e) => setProfileData({...profileData, vehicleBrand: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicleModel">Modèle</Label>
                  <Input
                    id="vehicleModel"
                    value={profileData.vehicleModel}
                    onChange={(e) => setProfileData({...profileData, vehicleModel: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="licensePlate">Immatriculation</Label>
                  <Input
                    id="licensePlate"
                    value={profileData.licensePlate}
                    onChange={(e) => setProfileData({...profileData, licensePlate: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleProfileUpdate}>
                Mettre à jour les informations véhicule
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents officiels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="driverLicense">Numéro de permis</Label>
                  <Input
                    id="driverLicense"
                    value={profileData.driverLicense}
                    onChange={(e) => setProfileData({...profileData, driverLicense: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="insuranceNumber">Numéro d'assurance</Label>
                  <Input
                    id="insuranceNumber"
                    value={profileData.insuranceNumber}
                    onChange={(e) => setProfileData({...profileData, insuranceNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Permis de conduire</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="default">✓ Vérifié</Badge>
                    <Button variant="outline" size="sm" onClick={() => handleDocumentUpload('Permis de conduire')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Mettre à jour
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Assurance véhicule</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="default">✓ Vérifié</Badge>
                    <Button variant="outline" size="sm" onClick={() => handleDocumentUpload('Assurance véhicule')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Mettre à jour
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Carte grise</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="secondary">En attente</Badge>
                    <Button variant="outline" size="sm" onClick={() => handleDocumentUpload('Carte grise')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key}>
                    {key === 'newMissions' && 'Nouvelles missions'}
                    {key === 'paymentUpdates' && 'Mises à jour de paiement'}
                    {key === 'systemAlerts' && 'Alertes système'}
                    {key === 'emergencyAlerts' && 'Alertes d\'urgence'}
                  </Label>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, [key]: checked }
                      })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Confidentialité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.privacy).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key}>
                    {key === 'shareLocation' && 'Partager ma localisation'}
                    {key === 'showOnlineStatus' && 'Afficher mon statut en ligne'}
                    {key === 'allowDirectContact' && 'Autoriser le contact direct'}
                  </Label>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, [key]: checked }
                      })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Préférences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Langue</Label>
                  <Select value={settings.preferences.language}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="autoAcceptRadius">Rayon d'acceptation auto (km)</Label>
                  <Input
                    id="autoAcceptRadius"
                    value={settings.preferences.autoAcceptRadius}
                    onChange={(e) => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, autoAcceptRadius: e.target.value }
                    })}
                  />
                </div>
              </div>
              
              <Button onClick={handleSettingsUpdate}>
                Sauvegarder les paramètres
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DriverProfile;