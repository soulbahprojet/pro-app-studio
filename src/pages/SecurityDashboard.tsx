import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import OpenAISecurityDashboard from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import SecurityTestDashboard from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import ComprehensiveRoleAudit from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import { Shield, Brain, TestTube, Activity } from 'lucide-react';

const SecurityDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Centre de Sécurité 224SOLUTIONS
          </h1>
          <p className="text-muted-foreground">
            Surveillance, analyse et protection automatisée de votre plateforme
          </p>
        </div>
      </div>

      <Tabs defaultValue="ai-security" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai-security" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Sécurité IA
          </TabsTrigger>
          <TabsTrigger value="role-audit" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Audit des Rôles
          </TabsTrigger>
          <TabsTrigger value="security-tests" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Tests Sécurité
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Surveillance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-security">
          <OpenAISecurityDashboard />
        </TabsContent>

        <TabsContent value="role-audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Audit Complet des Rôles et Permissions
              </CardTitle>
              <CardDescription>
                Validation de la séparation des rôles et des permissions d'accès
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComprehensiveRoleAudit />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security-tests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Tests de Sécurité Automatisés
              </CardTitle>
              <CardDescription>
                Suite de tests pour valider la sécurité de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecurityTestDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Surveillance Continue</CardTitle>
                <CardDescription>
                  Monitoring en temps réel des activités critiques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Tables critiques surveillées</span>
                    <span className="font-semibold">8/8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>APIs fonctionnelles</span>
                    <span className="font-semibold text-green-600">100%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Flux critiques actifs</span>
                    <span className="font-semibold text-green-600">4/4</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métriques de Performance</CardTitle>
                <CardDescription>
                  Indicateurs de performance du système de sécurité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Temps de réponse moyen</span>
                    <span className="font-semibold">&lt; 200ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Taux d'erreur</span>
                    <span className="font-semibold text-green-600">&lt; 0.1%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Disponibilité</span>
                    <span className="font-semibold text-green-600">99.9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;
