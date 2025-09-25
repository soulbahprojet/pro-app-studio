import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Smartphone, Monitor, Download, CheckCircle, ExternalLink } from 'lucide-react';

interface InviteData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  creator_type: string;
  status: string;
  invite_token: string;
}

export default function UserInvitePage() {
  const { token } = useParams();
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'pc'>('mobile');
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    if (token) {
      loadInviteData();
      detectDevice();
    }
  }, [token]);

  const detectDevice = () => {
    const userAgent = navigator.userAgent || navigator.vendor;
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    setDeviceType(isMobile ? 'mobile' : 'pc');
  };

  const loadInviteData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('agent_users')
        .select('*')
        .eq('invite_token', token)
        .single();

      if (error) throw error;

      setInviteData(data);
      
      if (data.status === 'active') {
        setActivated(true);
      }
    } catch (error) {
      console.error('Error loading invite:', error);
      toast.error('Lien d\'invitation invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  const activateAccount = async () => {
    if (!token) return;

    try {
      setActivating(true);
      
      const { data, error } = await supabase.functions.invoke('agent-management', {
        body: {
          action: 'activate-user',
          inviteToken: token,
          deviceType: deviceType,
        },
      });

      if (error) throw error;

      setActivated(true);
      setDownloadUrl(data.downloadUrl);
      toast.success('Compte activé avec succès !');
    } catch (error) {
      console.error('Error activating account:', error);
      toast.error('Erreur lors de l\'activation du compte');
    } finally {
      setActivating(false);
    }
  };

  const openApp = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!inviteData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Lien Invalide</h2>
            <p className="text-gray-600">
              Ce lien d'invitation n'est pas valide ou a expiré.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <img src="/224solutions-logo.png" alt="224SOLUTIONS" className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl">Bienvenue sur 224SOLUTIONS</CardTitle>
          <p className="text-gray-600">Votre compte vous attend !</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Informations du compte</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Nom:</span> {inviteData.name}</p>
              {inviteData.email && (
                <p><span className="font-medium">Email:</span> {inviteData.email}</p>
              )}
              {inviteData.phone && (
                <p><span className="font-medium">Téléphone:</span> {inviteData.phone}</p>
              )}
              <div className="flex items-center space-x-2 mt-2">
                <span className="font-medium">Invité par:</span>
                <Badge variant="outline" className="text-xs">
                  {inviteData.creator_type === 'agent' ? 'Agent' : 'Sous-agent'}
                </Badge>
              </div>
            </div>
          </div>

          {!activated ? (
            <>
              {/* Device Selection */}
              <div>
                <h4 className="font-medium mb-3">Choisissez votre appareil</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDeviceType('mobile')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      deviceType === 'mobile'
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Smartphone className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Mobile</p>
                    <p className="text-xs text-gray-500">Android/iOS</p>
                  </button>
                  
                  <button
                    onClick={() => setDeviceType('pc')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      deviceType === 'pc'
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Monitor className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">PC</p>
                    <p className="text-xs text-gray-500">Web</p>
                  </button>
                </div>
              </div>

              {/* Activation Button */}
              <Button
                onClick={activateAccount}
                disabled={activating}
                className="w-full"
                size="lg"
              >
                {activating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Activation en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Activer mon compte
                  </>
                )}
              </Button>
            </>
          ) : (
            /* Success State */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">
                  Compte Activé !
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Votre compte 224SOLUTIONS est maintenant actif. 
                  {deviceType === 'mobile' 
                    ? ' Téléchargez l\'application pour commencer.'
                    : ' Accédez à la plateforme web pour commencer.'
                  }
                </p>
              </div>

              <Button
                onClick={openApp}
                className="w-full"
                size="lg"
              >
                {deviceType === 'mobile' ? (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger l'App
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Accéder à la Plateforme
                  </>
                )}
              </Button>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-700">
                  💡 <span className="font-medium">Astuce:</span> Ajoutez cette page à vos favoris 
                  pour un accès rapide à votre compte.
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 border-t pt-4">
            <p>
              Propulsé par <span className="font-medium">224SOLUTIONS</span>
            </p>
            <p>La plateforme tout-en-un pour vos services</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
