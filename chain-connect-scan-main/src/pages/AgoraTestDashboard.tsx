import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AgoraService, AGORA_CONFIG } from '@/utils/agoraConfig';
import { useAuth } from '@/contexts/AuthContext';
import { Phone, Users, Settings, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AgoraTestDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [testResults, setTestResults] = useState<{
    tokenGeneration: boolean | null;
    connectionTest: boolean | null;
    lastTestTime: string | null;
  }>({
    tokenGeneration: null,
    connectionTest: null,
    lastTestTime: null
  });
  
  const [testConfig, setTestConfig] = useState({
    channelName: AGORA_CONFIG.TEST_CHANNEL,
    role: AGORA_CONFIG.ROLES.PUBLISHER as 'publisher' | 'subscriber',
    expireIn: 3600
  });
  
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runTokenGenerationTest = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour tester",
        variant: "destructive",
      });
      return;
    }

    setIsRunningTests(true);
    
    try {
      console.log('🧪 Test de génération de token...');
      
      const result = await AgoraService.generateToken(
        testConfig.channelName,
        user.id,
        testConfig.role,
        testConfig.expireIn
      );
      
      if (result.success && result.token) {
        setTestResults(prev => ({ 
          ...prev, 
          tokenGeneration: true,
          lastTestTime: new Date().toLocaleTimeString()
        }));
        
        console.log('✅ Token généré avec succès:', {
          appId: result.appId,
          channelName: result.channelName,
          uid: result.uid,
          role: result.role,
          expiresAt: new Date(result.expiresAt! * 1000).toLocaleString()
        });
        
        toast({
          title: "✅ Test réussi",
          description: `Token généré pour le canal ${result.channelName}`,
        });
      } else {
        throw new Error(result.error || 'Échec de génération du token');
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, tokenGeneration: false }));
      console.error('❌ Erreur test token:', error);
      toast({
        title: "❌ Test échoué",
        description: error instanceof Error ? error.message : 'Erreur inconnue',
        variant: "destructive",
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const runConnectionTest = async () => {
    if (!user) return;
    
    setIsRunningTests(true);
    
    try {
      console.log('🧪 Test de connexion Agora...');
      
      const success = await AgoraService.testConnection(testConfig.channelName, user.id);
      
      setTestResults(prev => ({ 
        ...prev, 
        connectionTest: success,
        lastTestTime: new Date().toLocaleTimeString()
      }));
      
      if (success) {
        console.log('✅ Test de connexion réussi');
        toast({
          title: "✅ Connexion OK",
          description: "La connexion Agora fonctionne correctement",
        });
      } else {
        throw new Error('Échec du test de connexion');
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, connectionTest: false }));
      console.error('❌ Erreur test connexion:', error);
      toast({
        title: "❌ Connexion échouée",
        description: "Impossible de se connecter à Agora",
        variant: "destructive",
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const runAllTests = async () => {
    await runTokenGenerationTest();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pause entre les tests
    await runConnectionTest();
  };

  const TestResultIcon = ({ result }: { result: boolean | null }) => {
    if (result === null) return <div className="w-5 h-5 rounded-full bg-muted" />;
    return result ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> : 
      <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Dashboard de Tests Agora
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Configuration des tests */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="channelName">Canal de test</Label>
              <Input
                id="channelName"
                value={testConfig.channelName}
                onChange={(e) => setTestConfig(prev => ({ ...prev, channelName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="role">Rôle</Label>
              <select
                id="role"
                className="w-full px-3 py-2 border rounded-md"
                value={testConfig.role}
                onChange={(e) => setTestConfig(prev => ({ ...prev, role: e.target.value as 'publisher' | 'subscriber' }))}
              >
                <option value="publisher">Publisher (Diffuseur)</option>
                <option value="subscriber">Subscriber (Spectateur)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="expireIn">Expiration (secondes)</Label>
              <Input
                id="expireIn"
                type="number"
                value={testConfig.expireIn}
                onChange={(e) => setTestConfig(prev => ({ ...prev, expireIn: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          {/* Boutons de test */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={runTokenGenerationTest}
              disabled={isRunningTests || !user}
              variant="outline"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Test Génération Token
            </Button>
            
            <Button
              onClick={runConnectionTest}
              disabled={isRunningTests || !user}
              variant="outline"
            >
              <Phone className="h-4 w-4 mr-2" />
              Test Connexion
            </Button>
            
            <Button
              onClick={runAllTests}
              disabled={isRunningTests || !user}
              className="bg-primary"
            >
              <Users className="h-4 w-4 mr-2" />
              Lancer Tous les Tests
            </Button>
          </div>

          {/* Résultats des tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Résultats des Tests</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <span>Génération de Token</span>
                <TestResultIcon result={testResults.tokenGeneration} />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <span>Test de Connexion</span>
                <TestResultIcon result={testResults.connectionTest} />
              </div>
            </div>
            
            {testResults.lastTestTime && (
              <p className="text-sm text-muted-foreground">
                Dernier test: {testResults.lastTestTime}
              </p>
            )}
          </div>

          {/* Instructions */}
          <Alert>
            <AlertDescription>
              <strong>Instructions:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• <strong>Test Token:</strong> Vérifie que les secrets Agora sont configurés</li>
                <li>• <strong>Test Connexion:</strong> Valide la génération et l'utilisation des tokens</li>
                <li>• <strong>Canal de test:</strong> Utilisez "224solutions-test" pour les tests</li>
                <li>• <strong>Rôles:</strong> Publisher peut envoyer/recevoir, Subscriber ne fait que recevoir</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Status utilisateur */}
          {user && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                <strong>Utilisateur:</strong> {user.email} <br />
                <strong>ID:</strong> {user.id}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgoraTestDashboard;