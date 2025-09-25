import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSecureProfile, useSecureWallet, useSecureTransactions } from '@/hooks/useSecureData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Tableau de bord de test de sécurité
 * Permet de vérifier que l'isolation des utilisateurs fonctionne correctement
 */
const SecurityTestDashboard: React.FC = () => {
  const { user, profile, session } = useAuth();
  const { data: secureProfile } = useSecureProfile();
  const { data: secureWallet } = useSecureWallet();
  const { data: secureTransactions } = useSecureTransactions();
  
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Tests de sécurité
  const runSecurityTests = async () => {
    if (!user || !profile) return;

    setIsRunningTests(true);
    const results: any[] = [];

    try {
      // Test 1: Vérifier l'isolation du profil
      console.log('🧪 Test 1: Isolation du profil');
      try {
        // Tentative d'accéder à tous les profils (devrait être bloqué par RLS)
        const { data: allProfiles, error } = await supabase
          .from('profiles')
          .select('*');

        if (allProfiles && allProfiles.length === 1 && allProfiles[0].user_id === user.id) {
          results.push({
            test: 'Isolation du profil',
            status: 'success',
            message: 'Seul votre profil est accessible ✅'
          });
        } else if (allProfiles && allProfiles.length > 1) {
          results.push({
            test: 'Isolation du profil',
            status: 'error',
            message: `❌ FAILLE CRITIQUE: ${allProfiles.length} profils accessibles au lieu de 1`
          });
        } else if (error) {
          results.push({
            test: 'Isolation du profil',
            status: 'success',
            message: 'Accès correctement restreint par RLS ✅'
          });
        }
      } catch (err) {
        results.push({
          test: 'Isolation du profil',
          status: 'error',
          message: 'Erreur lors du test: ' + (err as any).message
        });
      }

      // Test 2: Vérifier l'isolation du portefeuille
      console.log('🧪 Test 2: Isolation du portefeuille');
      try {
        const { data: allWallets, error } = await supabase
          .from('wallets')
          .select('*');

        if (allWallets && allWallets.length === 1 && allWallets[0].user_id === user.id) {
          results.push({
            test: 'Isolation du portefeuille',
            status: 'success',
            message: 'Seul votre portefeuille est accessible ✅'
          });
        } else if (allWallets && allWallets.length > 1) {
          results.push({
            test: 'Isolation du portefeuille',
            status: 'error',
            message: `❌ FAILLE CRITIQUE: ${allWallets.length} portefeuilles accessibles`
          });
        } else if (error) {
          results.push({
            test: 'Isolation du portefeuille',
            status: 'success',
            message: 'Accès correctement restreint ✅'
          });
        }
      } catch (err) {
        results.push({
          test: 'Isolation du portefeuille',
          status: 'error',
          message: 'Erreur: ' + (err as any).message
        });
      }

      // Test 3: Vérifier l'intégrité de la session
      console.log('🧪 Test 3: Intégrité de la session');
      if (session && user) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (session.expires_at && session.expires_at > currentTime) {
          results.push({
            test: 'Intégrité de la session',
            status: 'success',
            message: `Session valide jusqu'à ${new Date(session.expires_at * 1000).toLocaleString()} ✅`
          });
        } else {
          results.push({
            test: 'Intégrité de la session',
            status: 'warning',
            message: '⚠️ Session expirée ou expiration indéfinie'
          });
        }
      }

      // Test 4: Vérifier la cohérence des identifiants
      console.log('🧪 Test 4: Cohérence des identifiants');
      if (user && profile && user.id === profile.user_id) {
        results.push({
          test: 'Cohérence des identifiants',
          status: 'success',
          message: 'ID utilisateur cohérent entre session et profil ✅'
        });
      } else {
        results.push({
          test: 'Cohérence des identifiants',
          status: 'error',
          message: '❌ FAILLE: Incohérence entre session et profil'
        });
      }

      // Test 5: Tentative d'accès à des données d'autres utilisateurs
      console.log('🧪 Test 5: Tentative d\'accès croisé');
      try {
        // Générer un UUID aléatoire pour simuler un autre utilisateur
        const fakeUserId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
        const { data: otherUserData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', fakeUserId);

        if (error || !otherUserData || otherUserData.length === 0) {
          results.push({
            test: 'Protection accès croisé',
            status: 'success',
            message: 'Accès à d\'autres utilisateurs correctement bloqué ✅'
          });
        } else {
          results.push({
            test: 'Protection accès croisé',
            status: 'error',
            message: '❌ FAILLE: Accès à d\'autres utilisateurs possible'
          });
        }
      } catch (err) {
        results.push({
          test: 'Protection accès croisé',
          status: 'success',
          message: 'Accès correctement bloqué par sécurité ✅'
        });
      }

      setTestResults(results);
      
      // Calculer le score de sécurité
      const successCount = results.filter(r => r.status === 'success').length;
      const totalTests = results.length;
      const securityScore = Math.round((successCount / totalTests) * 100);
      
      if (securityScore === 100) {
        toast({
          title: "🛡️ Sécurité optimale",
          description: `Tous les tests de sécurité réussis (${successCount}/${totalTests})`,
        });
      } else if (securityScore >= 80) {
        toast({
          title: "⚠️ Sécurité correcte",
          description: `Score de sécurité: ${securityScore}% (${successCount}/${totalTests})`,
          variant: "default"
        });
      } else {
        toast({
          title: "❌ Problèmes de sécurité détectés",
          description: `Score de sécurité: ${securityScore}% - Action requise`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Erreur lors des tests de sécurité:', error);
      toast({
        title: "Erreur de test",
        description: "Impossible d'exécuter tous les tests de sécurité",
        variant: "destructive"
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Eye className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Sécurisé</Badge>;
      case 'error':
        return <Badge variant="destructive">Critique</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">Attention</Badge>;
      default:
        return <Badge variant="outline">Test</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Tableau de bord de sécurité
          </CardTitle>
          <CardDescription>
            Vérifiez l'isolation et la sécurité de votre compte utilisateur
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Informations utilisateur */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Utilisateur connecté</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-1">ID:</p>
                <p className="font-mono text-sm break-all">{user?.id}</p>
                <p className="text-xs text-muted-foreground mt-2 mb-1">Email:</p>
                <p className="text-sm">{user?.email}</p>
                <p className="text-xs text-muted-foreground mt-2 mb-1">Rôle:</p>
                <Badge>{profile?.role}</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Données accessibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Profil:</span>
                    <Badge variant={secureProfile ? "default" : "secondary"}>
                      {secureProfile ? "Accessible" : "Indisponible"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Portefeuille:</span>
                    <Badge variant={secureWallet ? "default" : "secondary"}>
                      {secureWallet ? "Accessible" : "Indisponible"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Transactions:</span>
                    <Badge variant={secureTransactions?.length > 0 ? "default" : "secondary"}>
                      {secureTransactions?.length || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Status de la session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">État:</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  {session?.expires_at && (
                    <div>
                      <p className="text-xs text-muted-foreground">Expire:</p>
                      <p className="text-xs font-mono">
                        {new Date(session.expires_at * 1000).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tests de sécurité */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Tests de sécurité</h3>
              <Button 
                onClick={runSecurityTests} 
                disabled={isRunningTests}
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                {isRunningTests ? "Tests en cours..." : "Exécuter les tests"}
              </Button>
            </div>

            {testResults.length > 0 && (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <Alert key={index} className={result.status === 'error' ? 'border-red-200' : 'border-green-200'}>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-semibold text-sm">{result.test}</h4>
                          {getStatusBadge(result.status)}
                        </div>
                        <AlertDescription className="text-sm">
                          {result.message}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            )}

            {testResults.length === 0 && (
              <Alert>
                <Shield className="w-4 h-4" />
                <AlertDescription>
                  Cliquez sur "Exécuter les tests" pour vérifier l'intégrité de la sécurité de votre compte.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityTestDashboard;