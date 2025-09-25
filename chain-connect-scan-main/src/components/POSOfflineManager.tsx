import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Trash2,
  RefreshCw,
  Database
} from 'lucide-react';

interface OfflineSale {
  id: string;
  cart: any[];
  total: number;
  timestamp: number;
  customerInfo?: any;
}

export default function POSOfflineManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineSales, setOfflineSales] = useState<OfflineSale[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      autoSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadOfflineSales();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineSales = () => {
    const saved = localStorage.getItem(`offline_sales_${user?.id}`);
    if (saved) {
      try {
        const sales = JSON.parse(saved);
        setOfflineSales(sales);
      } catch (error) {
        console.error('Erreur chargement ventes hors ligne:', error);
      }
    }

    const lastSyncTime = localStorage.getItem(`last_sync_${user?.id}`);
    if (lastSyncTime) {
      setLastSync(new Date(parseInt(lastSyncTime)));
    }
  };

  const autoSync = async () => {
    if (offlineSales.length > 0 && isOnline) {
      await syncSales();
    }
  };

  const syncSales = async () => {
    if (!user || offlineSales.length === 0) return;

    setSyncing(true);
    let successCount = 0;
    let failedSales: OfflineSale[] = [];

    try {
      for (const sale of offlineSales) {
        try {
          // Créer la commande
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
              customer_id: user.id,
              seller_id: user.id,
              total_amount: sale.total,
              currency: 'GNF' as any,
              status: 'completed' as any,
              delivery_address: 'Vente directe - POS (Hors ligne)',
              created_at: new Date(sale.timestamp).toISOString()
            })
            .select()
            .single();

          if (orderError) throw orderError;

          // Ajouter les articles
          for (const item of sale.cart) {
            const { error: itemError } = await supabase
              .from('order_items')
              .insert({
                order_id: order.id,
                product_id: item.product.id,
                quantity: item.quantity,
                unit_price: item.product.price,
                total_price: item.product.price * item.quantity * (1 - (item.discount || 0) / 100)
              });

            if (itemError) throw itemError;

            // Mettre à jour le stock
            const { error: stockError } = await supabase
              .from('products')
              .update({
                stock_quantity: item.product.stock_quantity - item.quantity
              })
              .eq('id', item.product.id);

            if (stockError) {
              console.warn('Erreur mise à jour stock:', stockError);
              // Ne pas faire échouer la synchronisation pour les erreurs de stock
            }
          }

          successCount++;
        } catch (error) {
          console.error('Erreur synchronisation vente:', error);
          failedSales.push(sale);
        }
      }

      // Mettre à jour le stockage local
      if (failedSales.length < offlineSales.length) {
        setOfflineSales(failedSales);
        localStorage.setItem(`offline_sales_${user.id}`, JSON.stringify(failedSales));
        
        const syncTime = Date.now();
        setLastSync(new Date(syncTime));
        localStorage.setItem(`last_sync_${user.id}`, syncTime.toString());

        toast({
          title: "Synchronisation réussie",
          description: `${successCount} vente(s) synchronisée(s)${failedSales.length > 0 ? `, ${failedSales.length} échec(s)` : ''}`,
        });
      }

      if (failedSales.length > 0) {
        toast({
          title: "Synchronisation partielle",
          description: `${failedSales.length} vente(s) n'ont pas pu être synchronisées`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Erreur synchronisation globale:', error);
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser les ventes hors ligne",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const deleteSale = (saleId: string) => {
    const updatedSales = offlineSales.filter(sale => sale.id !== saleId);
    setOfflineSales(updatedSales);
    localStorage.setItem(`offline_sales_${user?.id}`, JSON.stringify(updatedSales));
    
    toast({
      title: "Vente supprimée",
      description: "La vente hors ligne a été supprimée"
    });
  };

  const clearAllSales = () => {
    setOfflineSales([]);
    localStorage.removeItem(`offline_sales_${user?.id}`);
    
    toast({
      title: "Toutes les ventes supprimées",
      description: "Toutes les ventes hors ligne ont été supprimées"
    });
  };

  return (
    <div className="space-y-6">
      {/* État de connexion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="h-5 w-5 text-green-600" />
                Connexion active
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-red-600" />
                Mode hors ligne
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isOnline 
              ? "Toutes les fonctionnalités sont disponibles"
              : "Fonctionnalités limitées - Les ventes seront synchronisées à la reconnexion"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">
                Ventes en attente: {offlineSales.length}
              </div>
              {lastSync && (
                <div className="text-xs text-muted-foreground">
                  Dernière sync: {lastSync.toLocaleString()}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {isOnline && offlineSales.length > 0 && (
                <Button
                  onClick={syncSales}
                  disabled={syncing}
                  size="sm"
                >
                  {syncing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Synchronisation...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Synchroniser
                    </>
                  )}
                </Button>
              )}
              
              {offlineSales.length > 0 && (
                <Button
                  onClick={clearAllSales}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Tout effacer
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ventes hors ligne */}
      {offlineSales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Ventes en attente de synchronisation
            </CardTitle>
            <CardDescription>
              Ces ventes ont été enregistrées hors ligne et seront synchronisées dès que la connexion sera rétablie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {offlineSales.map((sale) => (
                  <Card key={sale.id} className="border-dashed">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium">
                            Vente #{sale.id.slice(0, 8)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(sale.timestamp).toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {sale.total.toLocaleString()} GNF
                          </Badge>
                          <Button
                            onClick={() => deleteSale(sale.id)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          Articles ({sale.cart.length}):
                        </div>
                        {sale.cart.map((item, index) => (
                          <div key={index} className="text-xs text-muted-foreground flex justify-between">
                            <span>{item.product.name} x{item.quantity}</span>
                            <span>{(item.product.price * item.quantity).toLocaleString()} GNF</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          <span className="text-orange-600">En attente de synchronisation</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Mode d'emploi */}
      <Card>
        <CardHeader>
          <CardTitle>Mode hors ligne</CardTitle>
          <CardDescription>
            Comment utiliser le POS sans connexion internet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <div className="font-medium">Vente hors ligne</div>
                <div className="text-sm text-muted-foreground">
                  Les ventes peuvent être enregistrées même sans connexion internet
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <div className="font-medium">Stockage local</div>
                <div className="text-sm text-muted-foreground">
                  Les données sont sauvegardées localement sur cet appareil
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <div className="font-medium">Synchronisation automatique</div>
                <div className="text-sm text-muted-foreground">
                  Dès que la connexion est rétablie, les ventes sont automatiquement synchronisées
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
              <CheckCircle className="h-4 w-4" />
              Fonctionnalités disponibles hors ligne
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Ajout de produits au panier</li>
              <li>• Application de remises</li>
              <li>• Finalisation des ventes</li>
              <li>• Gestion du stock local</li>
              <li>• Impression de reçus (si imprimante locale)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}