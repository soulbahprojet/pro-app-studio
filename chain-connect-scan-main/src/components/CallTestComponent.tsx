import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AgoraService, AGORA_CONFIG } from '@/utils/agoraConfig';
import { useAuth } from '@/contexts/AuthContext';
import { Phone, TestTube, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CallTestComponent: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [channelName, setChannelName] = useState(AGORA_CONFIG.TEST_CHANNEL);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const testConnection = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour tester",
        variant: "destructive",
      });
      return;
    }

    setIsTestingConnection(true);
    setConnectionResult(null);

    try {
      const success = await AgoraService.testConnection(channelName, user.id);
      
      if (success) {
        setConnectionResult({
          success: true,
          message: "✅ Connexion Agora réussie ! Vous pouvez rejoindre des appels."
        });
        toast({
          title: "Test réussi",
          description: "La connexion Agora fonctionne correctement",
        });
      } else {
        setConnectionResult({
          success: false,
          message: "❌ Échec de la connexion. Vérifiez la configuration Agora."
        });
        toast({
          title: "Test échoué",
          description: "Impossible de se connecter à Agora",
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionResult({
        success: false,
        message: `❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
      toast({
        title: "Erreur de test",
        description: "Une erreur est survenue lors du test",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const joinCall = () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour rejoindre un appel",
        variant: "destructive",
      });
      return;
    }

    // Navigate to call screen with channel name
    navigate(`/call?channel=${encodeURIComponent(channelName)}`);
  };

  const openTestChannel = () => {
    navigate(`/call?channel=${encodeURIComponent(AGORA_CONFIG.TEST_CHANNEL)}`);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Test Agora - Appels Vidéo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Test */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="channelName">Nom du canal</Label>
            <Input
              id="channelName"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="Entrez le nom du canal"
            />
          </div>
          
          <Button
            onClick={testConnection}
            disabled={isTestingConnection || !channelName.trim()}
            className="w-full"
            variant="outline"
          >
            <TestTube className="h-4 w-4 mr-2" />
            {isTestingConnection ? 'Test en cours...' : 'Tester la connexion'}
          </Button>

          {connectionResult && (
            <div className={`p-4 rounded-lg ${
              connectionResult.success 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {connectionResult.message}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="font-semibold">Actions rapides</h3>
          
          <Button
            onClick={openTestChannel}
            className="w-full"
            disabled={!user}
          >
            <Users className="h-4 w-4 mr-2" />
            Rejoindre le canal de test (224solutions-test)
          </Button>
          
          <Button
            onClick={joinCall}
            disabled={!user || !channelName.trim()}
            className="w-full"
            variant="secondary"
          >
            <Phone className="h-4 w-4 mr-2" />
            Rejoindre le canal: {channelName}
          </Button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Instructions</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Testez d'abord la connexion avant de rejoindre un appel</li>
            <li>• Ouvrez plusieurs onglets pour simuler plusieurs participants</li>
            <li>• Les appels sont sécurisés avec des tokens temporaires (24h)</li>
            <li>• L'historique des appels est enregistré dans Firebase</li>
          </ul>
        </div>

        {/* User Info */}
        {user && (
          <div className="text-sm text-muted-foreground">
            Connecté en tant que: {user.email} (ID: {user.id})
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CallTestComponent;