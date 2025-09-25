import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Settings, Users, BarChart3 } from 'lucide-react';

interface WhatsAppTemplate {
  id: string;
  name: string;
  trigger: string;
  message: string;
  enabled: boolean;
  variables: string[];
}

interface WhatsAppContact {
  id: string;
  name: string;
  phone: string;
  country: string;
  lastMessage: string;
  status: 'active' | 'inactive';
}

export default function WhatsAppNotifications() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([
    {
      id: '1',
      name: 'Expédition Créée',
      trigger: 'shipment_created',
      message: 'Bonjour {{customer_name}}, votre expédition {{tracking_code}} a été créée. Suivez-la sur: {{tracking_url}}',
      enabled: true,
      variables: ['customer_name', 'tracking_code', 'tracking_url']
    },
    {
      id: '2',
      name: 'En Transit',
      trigger: 'shipment_in_transit',
      message: 'Votre colis {{tracking_code}} est maintenant en transit vers {{destination}}. Livraison estimée: {{delivery_date}}',
      enabled: true,
      variables: ['tracking_code', 'destination', 'delivery_date']
    },
    {
      id: '3',
      name: 'Livré',
      trigger: 'shipment_delivered',
      message: '✅ Votre colis {{tracking_code}} a été livré avec succès! Merci de votre confiance 224SOLUTIONS.',
      enabled: true,
      variables: ['tracking_code']
    },
    {
      id: '4',
      name: 'Retard Détecté',
      trigger: 'delay_detected',
      message: '⚠️ Nous vous informons d\'un retard possible sur votre expédition {{tracking_code}}. Nouveau délai: {{new_delivery_date}}',
      enabled: false,
      variables: ['tracking_code', 'new_delivery_date']
    }
  ]);

  const [contacts, setContacts] = useState<WhatsAppContact[]>([
    {
      id: '1',
      name: 'Mamadou Diallo',
      phone: '+224623456789',
      country: 'Guinée',
      lastMessage: 'Livré avec succès',
      status: 'active'
    },
    {
      id: '2',
      name: 'Fatou Camara',
      phone: '+224625789123',
      country: 'Guinée',
      lastMessage: 'En transit',
      status: 'active'
    },
    {
      id: '3',
      name: 'Ahmed Sylla',
      phone: '+224627123456',
      country: 'Guinée',
      lastMessage: 'Expédition créée',
      status: 'inactive'
    }
  ]);

  const [manualMessage, setManualMessage] = useState({
    phone: '',
    message: ''
  });

  const [stats] = useState({
    totalSent: 1247,
    deliveredRate: 94.2,
    responseRate: 23.8,
    activeContacts: 89
  });

  const handleToggleTemplate = (templateId: string) => {
    setTemplates(templates.map(template => 
      template.id === templateId 
        ? { ...template, enabled: !template.enabled }
        : template
    ));
    toast({
      title: "Modèle mis à jour",
      description: "Les paramètres du modèle ont été sauvegardés"
    });
  };

  const handleSendManualMessage = async () => {
    if (!manualMessage.phone || !manualMessage.message) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir le numéro et le message",
        variant: "destructive"
      });
      return;
    }

    // Simuler l'envoi
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message envoyé",
      description: `Message envoyé avec succès à ${manualMessage.phone}`
    });

    setManualMessage({ phone: '', message: '' });
  };

  const handleTestTemplate = (template: WhatsAppTemplate) => {
    toast({
      title: "Test envoyé",
      description: `Test du modèle "${template.name}" envoyé à votre numéro de test`
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête et Statistiques */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Messages Envoyés</p>
                <p className="text-2xl font-bold">{stats.totalSent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Taux de Livraison</p>
                <p className="text-2xl font-bold">{stats.deliveredRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Taux de Réponse</p>
                <p className="text-2xl font-bold">{stats.responseRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Contacts Actifs</p>
                <p className="text-2xl font-bold">{stats.activeContacts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Modèles Auto</TabsTrigger>
          <TabsTrigger value="manual">Envoi Manuel</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Modèles de Messages Automatiques
              </CardTitle>
              <CardDescription>
                Configuration des notifications automatiques WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {template.trigger.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={template.enabled}
                          onCheckedChange={() => handleToggleTemplate(template.id)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestTemplate(template)}
                        >
                          Tester
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <p className="text-sm">{template.message}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-muted-foreground">Variables:</span>
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="secondary" className="text-xs">
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Envoi Manuel de Messages
              </CardTitle>
              <CardDescription>
                Envoyez des messages personnalisés à vos clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Numéro de Téléphone</Label>
                  <Input
                    id="phone"
                    placeholder="+224623456789"
                    value={manualMessage.phone}
                    onChange={(e) => setManualMessage({
                      ...manualMessage,
                      phone: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="template-select">Modèle Rapide</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    onChange={(e) => {
                      const template = templates.find(t => t.id === e.target.value);
                      if (template) {
                        setManualMessage({
                          ...manualMessage,
                          message: template.message
                        });
                      }
                    }}
                  >
                    <option value="">Sélectionner un modèle</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tapez votre message ici..."
                  value={manualMessage.message}
                  onChange={(e) => setManualMessage({
                    ...manualMessage,
                    message: e.target.value
                  })}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {manualMessage.message.length}/1000 caractères
                </p>
              </div>

              <Button 
                onClick={handleSendManualMessage}
                className="w-full"
                disabled={!manualMessage.phone || !manualMessage.message}
              >
                <Send className="w-4 h-4 mr-2" />
                Envoyer Message
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestion des Contacts
              </CardTitle>
              <CardDescription>
                Liste des contacts WhatsApp et leur statut
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium">{contact.name}</h4>
                        <p className="text-sm text-muted-foreground">{contact.phone}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge 
                        variant={contact.status === 'active' ? 'default' : 'secondary'}
                        className="mb-1"
                      >
                        {contact.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Dernier: {contact.lastMessage}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Paramètres WhatsApp Business
              </CardTitle>
              <CardDescription>
                Configuration de l'intégration WhatsApp Business API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Configuration Requise</h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Pour activer les notifications WhatsApp, vous devez configurer votre compte WhatsApp Business API.
                </p>
                <Button variant="outline" size="sm">
                  Guide de Configuration
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="whatsapp-token">Token WhatsApp Business</Label>
                  <Input
                    id="whatsapp-token"
                    type="password"
                    placeholder="Entrez votre token API"
                  />
                </div>
                <div>
                  <Label htmlFor="phone-number-id">ID Numéro de Téléphone</Label>
                  <Input
                    id="phone-number-id"
                    placeholder="ID de votre numéro WhatsApp"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Paramètres d'Envoi</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Délai entre Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Temps minimum entre deux messages automatiques
                    </p>
                  </div>
                  <select className="p-2 border rounded-md">
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 heure</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Heures d'Envoi</Label>
                    <p className="text-sm text-muted-foreground">
                      Restreindre l'envoi aux heures ouvrables
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Accusés de Lecture</Label>
                    <p className="text-sm text-muted-foreground">
                      Suivre les accusés de lecture des messages
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Button className="w-full">
                Sauvegarder Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}