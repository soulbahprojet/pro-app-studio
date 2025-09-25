import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePDGStatus } from '@/hooks/usePDGStatus';
import { toast } from 'sonner';

export const StripeSubscriptionManager = () => {
  const { user } = useAuth();
  const { isPDG, loading: pdgLoading } = usePDGStatus();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [subscriptionControlEnabled, setSubscriptionControlEnabled] = useState(false);

  const fetchAllSubscriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error fetching subscriptions:', error);
        toast.error('Erreur lors du chargement des abonnements');
        return;
      }

      if (data?.allSubscriptions) {
        setSubscriptions(data.allSubscriptions);
        toast.success(`${data.allSubscriptions.length} abonnements trouvés`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement des abonnements');
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { subscriptionId }
      });
      
      if (error) {
        console.error('Error canceling subscription:', error);
        toast.error('Erreur lors de l\'annulation');
        return;
      }

      toast.success('Abonnement annulé avec succès');
      await fetchAllSubscriptions();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de l\'annulation');
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (subscriptionId: string, newPlanId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-subscription', {
        body: { subscriptionId, newPlanId }
      });
      
      if (error) {
        console.error('Error updating subscription:', error);
        toast.error('Erreur lors de la mise à jour');
        return;
      }

      toast.success('Abonnement mis à jour avec succès');
      await fetchAllSubscriptions();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  if (pdgLoading) {
    return <div>Vérification des permissions...</div>;
  }

  if (!isPDG) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Accès réservé aux administrateurs PDG.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contrôles PDG</CardTitle>
          <CardDescription>
            Gestion des abonnements pour tous les utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="subscription-control"
              checked={subscriptionControlEnabled}
              onCheckedChange={setSubscriptionControlEnabled}
            />
            <Label htmlFor="subscription-control">
              Activer le contrôle des abonnements
            </Label>
          </div>
          
          {subscriptionControlEnabled && (
            <div className="space-y-4">
              <Button onClick={fetchAllSubscriptions} disabled={loading}>
                {loading ? 'Chargement...' : 'Charger tous les abonnements'}
              </Button>
              
              {subscriptions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Abonnements actifs</h3>
                  {subscriptions.map((subscription) => (
                    <Card key={subscription.id}>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium">Client: {subscription.customer?.email}</p>
                            <p className="text-sm text-muted-foreground">
                              Statut: {subscription.status}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Plan: {subscription.items?.data[0]?.price?.nickname || 'N/A'}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => cancelSubscription(subscription.id)}
                              variant="destructive"
                              size="sm"
                              disabled={loading}
                            >
                              Annuler l'abonnement
                            </Button>
                            <Button
                              onClick={() => updateSubscription(subscription.id, 'standard')}
                              variant="outline"
                              size="sm"
                              disabled={loading}
                            >
                              Passer en Standard
                            </Button>
                            <Button
                              onClick={() => updateSubscription(subscription.id, 'premium')}
                              variant="outline"
                              size="sm"
                              disabled={loading}
                            >
                              Passer en Premium
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StripeSubscriptionManager;