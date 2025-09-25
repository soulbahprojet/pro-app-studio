import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Badge } from '../../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import VendorPOS from '../vendor/VendorPOS';
import POSOfflineManager from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import { LoyaltyManager } from './LoyaltyManager';
import { ClickAndCollectManager } from './ClickAndCollectManager';
import { PeripheralManager } from './PeripheralManager';
import { POSReports } from './POSReports';
import { POSSettings } from './POSSettings';
import { 
  Calculator, 
  Gift, 
  Package, 
  Printer, 
  BarChart3, 
  Settings,
  Wifi,
  WifiOff,
  Store
} from 'lucide-react';

export default function ModernPOS() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeTab, setActiveTab] = useState('pos');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header POS */}
      <div className="bg-card border-b p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <Calculator className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">Point de Vente (POS)</h1>
              <p className="text-sm text-muted-foreground">
                Gestion complète de votre boutique physique
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant={isOnline ? "default" : "destructive"} className="gap-2">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4" />
                  En ligne
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  Hors ligne
                </>
              )}
            </Badge>
            
            <Button variant="outline" size="sm">
              <Store className="w-4 h-4 mr-2" />
              Boutique en ligne
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation principale POS */}
      <div className="max-w-7xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="pos" className="gap-2">
              <Calculator className="w-4 h-4" />
              Caisse
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="gap-2">
              <Gift className="w-4 h-4" />
              Fidélité
            </TabsTrigger>
            <TabsTrigger value="collect" className="gap-2">
              <Package className="w-4 h-4" />
              Click & Collect
            </TabsTrigger>
            <TabsTrigger value="peripherals" className="gap-2">
              <Printer className="w-4 h-4" />
              Matériel
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Rapports
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pos" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3">
                <VendorPOS />
              </div>
              <div className="xl:col-span-1">
                <POSOfflineManager />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="loyalty">
            <LoyaltyManager />
          </TabsContent>

          <TabsContent value="collect">
            <ClickAndCollectManager />
          </TabsContent>

          <TabsContent value="peripherals">
            <PeripheralManager />
          </TabsContent>

          <TabsContent value="reports">
            <POSReports />
          </TabsContent>

          <TabsContent value="settings">
            <POSSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
