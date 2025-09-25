import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Settings, 
  Store, 
  Receipt, 
  Bell,
  Shield,
  Palette,
  Save
} from 'lucide-react';

interface POSSettings {
  // Paramètres généraux
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  taxRate: number;
  currency: string;
  
  // Paramètres de reçu
  printReceipts: boolean;
  receiptHeader: string;
  receiptFooter: string;
  showLogo: boolean;
  
  // Notifications
  lowStockAlert: boolean;
  lowStockThreshold: number;
  dailyReportEmail: boolean;
  soundNotifications: boolean;
  
  // Sécurité
  requirePassword: boolean;
  sessionTimeout: number;
  logTransactions: boolean;
  
  // Interface
  theme: 'light' | 'dark' | 'auto';
  compactMode: boolean;
  showProductImages: boolean;
  gridColumns: number;
}

export function POSSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<POSSettings>({
    // Valeurs par défaut
    shopName: 'Ma Boutique',
    shopAddress: 'Conakry, Guinée',
    shopPhone: '+224 620 00 00 00',
    taxRate: 18,
    currency: 'GNF',
    
    printReceipts: true,
    receiptHeader: 'Merci pour votre achat',
    receiptFooter: 'A bientôt !',
    showLogo: true,
    
    lowStockAlert: true,
    lowStockThreshold: 10,
    dailyReportEmail: false,
    soundNotifications: true,
    
    requirePassword: false,
    sessionTimeout: 30,
    logTransactions: true,
    
    theme: 'light',
    compactMode: false,
    showProductImages: true,
    gridColumns: 4
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      // Charger les paramètres depuis le stockage local ou l'API
      const savedSettings = localStorage.getItem(`pos_settings_${user?.id}`);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    
    try {
      // Sauvegarder les paramètres
      localStorage.setItem(`pos_settings_${user?.id}`, JSON.stringify(settings));
      
      toast({
        title: "Paramètres sauvegardés",
        description: "Vos paramètres POS ont été mis à jour"
      });
      
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof POSSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
      localStorage.removeItem(`pos_settings_${user?.id}`);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration POS
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={resetSettings}
                variant="outline"
                size="sm"
              >
                Réinitialiser
              </Button>
              <Button
                onClick={saveSettings}
                disabled={saving}
                size="sm"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-transparent border-t-current" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="receipts">Reçus</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="interface">Interface</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Informations de la boutique
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shop-name">Nom de la boutique</Label>
                  <Input
                    id="shop-name"
                    value={settings.shopName}
                    onChange={(e) => updateSetting('shopName', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="shop-phone">Téléphone</Label>
                  <Input
                    id="shop-phone"
                    value={settings.shopPhone}
                    onChange={(e) => updateSetting('shopPhone', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="shop-address">Adresse</Label>
                <Input
                  id="shop-address"
                  value={settings.shopAddress}
                  onChange={(e) => updateSetting('shopAddress', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tax-rate">Taux de TVA (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.taxRate}
                    onChange={(e) => updateSetting('taxRate', Number(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="currency">Devise</Label>
                  <select
                    id="currency"
                    value={settings.currency}
                    onChange={(e) => updateSetting('currency', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="GNF">Franc Guinéen (GNF)</option>
                    <option value="USD">Dollar US (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Configuration des reçus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="print-receipts">Imprimer automatiquement les reçus</Label>
                <Switch
                  id="print-receipts"
                  checked={settings.printReceipts}
                  onCheckedChange={(checked) => updateSetting('printReceipts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-logo">Afficher le logo sur les reçus</Label>
                <Switch
                  id="show-logo"
                  checked={settings.showLogo}
                  onCheckedChange={(checked) => updateSetting('showLogo', checked)}
                />
              </div>
              
              <div>
                <Label htmlFor="receipt-header">En-tête du reçu</Label>
                <Input
                  id="receipt-header"
                  value={settings.receiptHeader}
                  onChange={(e) => updateSetting('receiptHeader', e.target.value)}
                  placeholder="Message d'en-tête"
                />
              </div>
              
              <div>
                <Label htmlFor="receipt-footer">Pied de page du reçu</Label>
                <Input
                  id="receipt-footer"
                  value={settings.receiptFooter}
                  onChange={(e) => updateSetting('receiptFooter', e.target.value)}
                  placeholder="Message de pied de page"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications et alertes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="low-stock-alert">Alertes de stock faible</Label>
                <Switch
                  id="low-stock-alert"
                  checked={settings.lowStockAlert}
                  onCheckedChange={(checked) => updateSetting('lowStockAlert', checked)}
                />
              </div>
              
              {settings.lowStockAlert && (
                <div>
                  <Label htmlFor="low-stock-threshold">Seuil d'alerte stock (unités)</Label>
                  <Input
                    id="low-stock-threshold"
                    type="number"
                    min="0"
                    value={settings.lowStockThreshold}
                    onChange={(e) => updateSetting('lowStockThreshold', Number(e.target.value))}
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-report-email">Rapport quotidien par email</Label>
                <Switch
                  id="daily-report-email"
                  checked={settings.dailyReportEmail}
                  onCheckedChange={(checked) => updateSetting('dailyReportEmail', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-notifications">Notifications sonores</Label>
                <Switch
                  id="sound-notifications"
                  checked={settings.soundNotifications}
                  onCheckedChange={(checked) => updateSetting('soundNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Sécurité et audit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="require-password">Exiger un mot de passe pour les ventes</Label>
                <Switch
                  id="require-password"
                  checked={settings.requirePassword}
                  onCheckedChange={(checked) => updateSetting('requirePassword', checked)}
                />
              </div>
              
              <div>
                <Label htmlFor="session-timeout">Délai d'expiration de session (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  min="5"
                  max="480"
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting('sessionTimeout', Number(e.target.value))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="log-transactions">Enregistrer toutes les transactions</Label>
                <Switch
                  id="log-transactions"
                  checked={settings.logTransactions}
                  onCheckedChange={(checked) => updateSetting('logTransactions', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interface">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Apparence et interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">Thème</Label>
                <select
                  id="theme"
                  value={settings.theme}
                  onChange={(e) => updateSetting('theme', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                  <option value="auto">Automatique</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="compact-mode">Mode compact</Label>
                <Switch
                  id="compact-mode"
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-product-images">Afficher les images des produits</Label>
                <Switch
                  id="show-product-images"
                  checked={settings.showProductImages}
                  onCheckedChange={(checked) => updateSetting('showProductImages', checked)}
                />
              </div>
              
              <div>
                <Label htmlFor="grid-columns">Colonnes de la grille de produits</Label>
                <Input
                  id="grid-columns"
                  type="number"
                  min="2"
                  max="8"
                  value={settings.gridColumns}
                  onChange={(e) => updateSetting('gridColumns', Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
