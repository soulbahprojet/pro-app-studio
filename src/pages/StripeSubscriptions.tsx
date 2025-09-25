import React from 'react';
import Layout from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import { StripeSubscriptionManager } from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { CreditCard, Shield, Zap } from 'lucide-react';

export default function StripeSubscriptions() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
          {/* En-tête */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Abonnements Stripe</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Gérez vos abonnements avec la sécurité et la fiabilité de Stripe. 
              Créez, modifiez ou annulez vos abonnements en toute sécurité.
            </p>
          </div>

          {/* Avantages de Stripe */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Sécurité Maximale</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Vos données de paiement sont protégées par la technologie de sécurité 
                  de classe mondiale de Stripe, conforme aux normes PCI DSS.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Paiements Instantanés</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Activez votre abonnement immédiatement après le paiement. 
                  Aucune attente, accès direct à toutes les fonctionnalités.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CreditCard className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Gestion Flexible</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Changez de plan, mettez à jour vos informations de paiement 
                  ou annulez votre abonnement à tout moment.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Composant principal de gestion */}
          <StripeSubscriptionManager />

          {/* Informations importantes */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Informations importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-blue-700">
              <p>• <strong>Sécurité :</strong> Vos informations de paiement ne transitent jamais par nos serveurs, elles sont directement traitées par Stripe.</p>
              <p>• <strong>Facturation :</strong> Les abonnements sont facturés mensuellement et renouvelés automatiquement.</p>
              <p>• <strong>Annulation :</strong> Vous pouvez annuler votre abonnement à tout moment. L'accès aux fonctionnalités premium reste actif jusqu'à la fin de votre période de facturation.</p>
              <p>• <strong>Support :</strong> En cas de problème, notre équipe support est disponible pour vous aider via le chat ou par email.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
  );
}
