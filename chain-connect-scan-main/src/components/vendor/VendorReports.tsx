import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileBarChart, Download, Calendar, TrendingUp, BarChart3 } from 'lucide-react';

interface VendorReportsProps {
  userProfile: any;
}

const VendorReports: React.FC<VendorReportsProps> = ({ userProfile }) => {
  return (
    <div className="space-y-6">
      {/* Actions rapides de rapports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileBarChart className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold">Rapport des Ventes</h3>
                <p className="text-sm text-muted-foreground">Analyse complète des ventes</p>
              </div>
            </div>
            <Button className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Générer PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold">Analyse Financière</h3>
                <p className="text-sm text-muted-foreground">Revenus et bénéfices</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Exporter Excel
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="font-semibold">Rapport Mensuel</h3>
                <p className="text-sm text-muted-foreground">Synthèse du mois</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Métriques principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Tableau de Bord Analytique
          </CardTitle>
          <CardDescription>
            Visualisez vos performances en temps réel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900">Ventes Totales</h4>
              <p className="text-2xl font-bold text-blue-600">4.2M GNF</p>
              <p className="text-sm text-blue-700">+12% ce mois</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900">Bénéfices</h4>
              <p className="text-2xl font-bold text-green-600">1.8M GNF</p>
              <p className="text-sm text-green-700">Marge 43%</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-900">Commandes</h4>
              <p className="text-2xl font-bold text-orange-600">156</p>
              <p className="text-sm text-orange-700">23 en attente</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900">Clients</h4>
              <p className="text-2xl font-bold text-purple-600">89</p>
              <p className="text-sm text-purple-700">12 nouveaux</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorReports;