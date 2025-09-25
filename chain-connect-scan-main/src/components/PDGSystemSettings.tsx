import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Settings, 
  RefreshCw, 
  Check, 
  X, 
  CreditCard,
  AlertTriangle,
  Shield
} from 'lucide-react';

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
  updated_at: string;
}

const PDGSystemSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [subscriptionSystemEnabled, setSubscriptionSystemEnabled] = useState(true);

  useEffect(() => {
    loadSystemSettings();
  }, []);

  const loadSystemSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      
      setSettings(data || []);
      
      // Extraire le statut du système d'abonnements
      const subscriptionSetting = data?.find(s => s.setting_key === 'subscription_system_enabled');
      if (subscriptionSetting) {
        setSubscriptionSystemEnabled((subscriptionSetting.setting_value as any)?.enabled ?? true);
      }
    } catch (error) {
      console.error('Error loading system settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres système",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscriptionSystem = async () => {
    setUpdating('subscription_system');
    
    try {
      const newValue = !subscriptionSystemEnabled;
      
      // S'assurer que la table system_settings existe et contient ce paramètre
      const { data: existingSetting, error: checkError } = await supabase
        .from('system_settings')
        .select('*')
        .eq('setting_key', 'subscription_system_enabled')
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing setting:', checkError);
      }

      let updateError;
      if (existingSetting) {
        // Mettre à jour le paramètre existant
        const { error } = await supabase
          .from('system_settings')
          .update({
            setting_value: { enabled: newValue },
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', 'subscription_system_enabled');
        updateError = error;
      } else {
        // Créer le paramètre s'il n'existe pas
        const { error } = await supabase
          .from('system_settings')
          .insert({
            setting_key: 'subscription_system_enabled',
            setting_value: { enabled: newValue },
            description: 'Contrôle global du système d\'abonnements payants'
          });
        updateError = error;
      }

      if (updateError) throw updateError;

      setSubscriptionSystemEnabled(newValue);
      
      // Si on désactive le système, on peut aussi mettre à jour tous les profils en mode gratuit
      if (!newValue) {
        // Optionnel : mettre à jour tous les profiles pour avoir accès gratuit
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ subscription_plan: 'premium' })
          .neq('subscription_plan', 'premium');
        
        if (profileError) {
          console.warn('Warning updating profiles:', profileError);
        }
      }
      
      toast({
        title: newValue ? "✅ Système d'abonnements activé" : "🎉 Mode gratuit activé !",
        description: newValue 
          ? "Les utilisateurs devront maintenant payer pour accéder aux fonctionnalités premium" 
          : "🚀 Toutes les fonctionnalités sont maintenant gratuites pour tous les utilisateurs ! Ils ont automatiquement accès au plan premium.",
        variant: newValue ? "default" : "default"
      });

      await loadSystemSettings(); // Recharger pour avoir les données à jour
    } catch (error) {
      console.error('Error updating subscription system:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de modifier le paramètre du système d'abonnements",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Chargement des paramètres système...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres Système - Configuration Globale
          </CardTitle>
          <CardDescription>
            Contrôlez les fonctionnalités principales de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
        </CardContent>
      </Card>

      {/* Section supprimée */}

      {/* Autres paramètres système */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Autres Paramètres Système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.map((setting) => (
              <div key={setting.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{setting.setting_key}</h4>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Mis à jour: {new Date(setting.updated_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {JSON.stringify(setting.setting_value)}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDGSystemSettings;