import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Building2, Users, FileText, BarChart3, Settings, Phone, Badge, AlertTriangle, MessageSquare, DollarSign, Vote } from 'lucide-react';
import BadgeManagement from '@/components/union/BadgeManagement';
import StatisticsDashboard from '@/components/syndicat/StatisticsDashboard';
import MessagerieModal from '@/components/syndicat/MessagerieModal';

const SyndicatBureau = () => {
  const navigate = useNavigate();
  const [isMessagerieOpen, setIsMessagerieOpen] = useState(false);

  const bureauFeatures = [
    {
      icon: Users,
      title: "Gestion des Membres",
      description: "Gérer les inscriptions et profils des motards",
      color: "bg-blue-50 text-blue-600 border-blue-200"
    },
    {
      icon: FileText,
      title: "Documents et Licences",
      description: "Vérification des permis et documents légaux",
      color: "bg-green-50 text-green-600 border-green-200"
    },
    {
      icon: BarChart3,
      title: "Statistiques",
      description: "Rapports d'activité et analyses de performance",
      color: "bg-purple-50 text-purple-600 border-purple-200"
    },
    {
      icon: Settings,
      title: "Configuration",
      description: "Paramètres du syndicat et zones d'opération",
      color: "bg-orange-50 text-orange-600 border-orange-200"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
            title="Retour"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bureau Syndicat</h1>
            <p className="text-muted-foreground">Gestion administrative des taxis motos</p>
          </div>
        </div>

        {/* Tabs principales */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-8 text-xs">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="members">Membres</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="sos">SOS</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="finances">Finances</TabsTrigger>
            <TabsTrigger value="meetings">Réunions</TabsTrigger>
            <TabsTrigger value="statistics">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {bureauFeatures.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${feature.color} mb-4`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Accéder
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Actions Rapides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Nouveau Membre
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Alertes SOS
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Messages Inter-Syndicats
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Gestion Financière
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Vote className="h-4 w-4" />
                    Réunions & Votes
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Statistiques
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Info Section */}
            <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Bureau Syndicat des Taxis Motos</h3>
                    <p className="text-muted-foreground text-sm">
                      Interface dédiée à la gestion administrative et au contrôle des activités des taxis motos. 
                      Gérez les membres, vérifiez les documents, consultez les statistiques et configurez les paramètres du syndicat.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestion des Membres
                </CardTitle>
                <CardDescription>
                  Gérer les inscriptions et profils des taxi-motos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-blue-600">152</div>
                      <p className="text-sm text-muted-foreground">Membres totaux</p>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-green-600">142</div>
                      <p className="text-sm text-muted-foreground">Badges actifs</p>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-orange-600">10</div>
                      <p className="text-sm text-muted-foreground">En attente</p>
                    </Card>
                  </div>
                  <Button className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Ajouter un nouveau membre
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges" className="mt-6">
            <BadgeManagement />
          </TabsContent>

          <TabsContent value="sos" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alertes SOS
                </CardTitle>
                <CardDescription>
                  Gestion des alertes de sécurité des taxi-motos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="p-4 border-red-200 bg-red-50">
                      <div className="text-2xl font-bold text-red-600">3</div>
                      <p className="text-sm text-muted-foreground">Alertes actives</p>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-green-600">47</div>
                      <p className="text-sm text-muted-foreground">Résolues ce mois</p>
                    </Card>
                  </div>
                  <Button variant="destructive" className="w-full">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Voir les alertes en cours
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages Inter-Syndicats
                </CardTitle>
                <CardDescription>
                  Communication entre bureaux syndicaux
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <p className="text-sm text-muted-foreground">Messages non lus</p>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-green-600">8</div>
                      <p className="text-sm text-muted-foreground">Syndicats connectés</p>
                    </Card>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => setIsMessagerieOpen(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ouvrir la messagerie
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finances" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Gestion Financière
                </CardTitle>
                <CardDescription>
                  Cotisations, tickets et finances du syndicat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-green-600">2.45M GNF</div>
                      <p className="text-sm text-muted-foreground">Revenus totaux</p>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-blue-600">1.8M GNF</div>
                      <p className="text-sm text-muted-foreground">Tickets vendus</p>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-purple-600">650K GNF</div>
                      <p className="text-sm text-muted-foreground">Cotisations</p>
                    </Card>
                  </div>
                  <Button className="w-full">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Voir les détails financiers
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meetings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="h-5 w-5" />
                  Réunions et Votes
                </CardTitle>
                <CardDescription>
                  Planification des réunions et votes syndicaux
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-blue-600">2</div>
                      <p className="text-sm text-muted-foreground">Réunions prévues</p>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-green-600">1</div>
                      <p className="text-sm text-muted-foreground">Vote en cours</p>
                    </Card>
                  </div>
                  <Button className="w-full">
                    <Vote className="h-4 w-4 mr-2" />
                    Planifier une réunion
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="mt-6">
            <StatisticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
      
      <MessagerieModal 
        open={isMessagerieOpen} 
        onOpenChange={setIsMessagerieOpen} 
      />
    </div>
  );
};

export default SyndicatBureau;