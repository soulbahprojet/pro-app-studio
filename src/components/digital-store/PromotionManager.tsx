import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Percent,
  DollarSign,
  Users,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_amount: number;
  max_uses: number;
  current_uses: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

interface PromotionManagerProps {
  shopId: string;
}

export function PromotionManager({ shopId }: PromotionManagerProps) {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    minAmount: 0,
    maxUses: 100,
    expiresAt: ''
  });

  useEffect(() => {
    loadPromoCodes();
  }, [shopId]);

  const loadPromoCodes = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('digital-store-management', {
        body: { operation: 'get-promo-codes', shop_id: shopId }
      });

      if (error) throw error;
      setPromoCodes(data.promoCodes || []);
    } catch (error) {
      console.error('Error loading promo codes:', error);
      toast.error('Erreur lors du chargement des codes promo');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || formData.discountValue <= 0) return;

    try {
      const { data, error } = await supabase.functions.invoke('digital-store-management', {
        body: {
          operation: 'create-promo-code',
          shopId,
          ...formData
        }
      });

      if (error) throw error;

      setPromoCodes(prev => [data.promo, ...prev]);
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        minAmount: 0,
        maxUses: 100,
        expiresAt: ''
      });
      setShowCreateForm(false);
      toast.success('Code promo créé avec succès !');
    } catch (error) {
      console.error('Error creating promo code:', error);
      toast.error('Erreur lors de la création du code promo');
    }
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code ${code} copié !`);
  };

  const togglePromoStatus = async (promoId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active: !currentStatus })
        .eq('id', promoId);

      if (error) throw error;

      setPromoCodes(prev => 
        prev.map(promo => 
          promo.id === promoId 
            ? { ...promo, is_active: !currentStatus }
            : promo
        )
      );
      
      toast.success(!currentStatus ? 'Code promo activé' : 'Code promo désactivé');
    } catch (error) {
      console.error('Error toggling promo status:', error);
      toast.error('Erreur lors de la modification du statut');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const getDiscountDisplay = (type: string, value: number) => {
    return type === 'percentage' ? `${value}%` : `${value.toLocaleString()} GNF`;
  };

  if (loading) {
    return <div className="animate-pulse">Chargement des promotions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des promotions</h2>
          <p className="text-muted-foreground">
            Créez et gérez vos codes promotionnels pour booster vos ventes
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Créer un code promo
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Codes actifs</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promoCodes.filter(promo => promo.is_active && !isExpired(promo.expires_at)).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promoCodes.reduce((sum, promo) => sum + promo.current_uses, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'utilisation</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promoCodes.length > 0 
                ? Math.round((promoCodes.filter(p => p.current_uses > 0).length / promoCodes.length) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Économies offertes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 GNF</div>
            <p className="text-xs text-muted-foreground">
              Calcul en cours...
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create Promo Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nouveau code promotionnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePromoCode} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="promo-code">Code promotionnel</Label>
                  <div className="flex gap-2">
                    <Input
                      id="promo-code"
                      placeholder="Ex: SOLDES2024"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      required
                    />
                    <Button type="button" variant="outline" onClick={generateRandomCode}>
                      Générer
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount-type">Type de réduction</Label>
                  <Select 
                    value={formData.discountType} 
                    onValueChange={(value: 'percentage' | 'fixed') => 
                      setFormData(prev => ({ ...prev, discountType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Pourcentage</SelectItem>
                      <SelectItem value="fixed">Montant fixe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount-value">
                    Valeur de la réduction {formData.discountType === 'percentage' ? '(%)' : '(GNF)'}
                  </Label>
                  <Input
                    id="discount-value"
                    type="number"
                    min="1"
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                    value={formData.discountValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-amount">Montant minimum (GNF)</Label>
                  <Input
                    id="min-amount"
                    type="number"
                    min="0"
                    value={formData.minAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, minAmount: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-uses">Utilisations maximum</Label>
                  <Input
                    id="max-uses"
                    type="number"
                    min="1"
                    value={formData.maxUses}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxUses: Number(e.target.value) }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires-at">Date d'expiration</Label>
                <Input
                  id="expires-at"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button type="submit" className="flex-1">
                  Créer le code promo
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Promo Codes List */}
      <div className="space-y-4">
        {promoCodes.map((promo) => (
          <Card key={promo.id} className="relative">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Tag className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{promo.code}</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyPromoCode(promo.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Réduction : {getDiscountDisplay(promo.discount_type, promo.discount_value)}
                      </span>
                      <span>•</span>
                      <span>
                        Utilisé : {promo.current_uses}/{promo.max_uses}
                      </span>
                      <span>•</span>
                      <span>
                        Expire le : {formatDate(promo.expires_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {promo.is_active && !isExpired(promo.expires_at) ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Actif
                      </Badge>
                    ) : isExpired(promo.expires_at) ? (
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        Expiré
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Inactif
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePromoStatus(promo.id, promo.is_active)}
                      disabled={isExpired(promo.expires_at)}
                    >
                      {promo.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {promo.min_amount > 0 && (
                <div className="mt-3 text-xs text-muted-foreground">
                  Montant minimum d'achat : {promo.min_amount.toLocaleString()} GNF
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {promoCodes.length === 0 && !showCreateForm && (
        <Card className="text-center py-12">
          <CardHeader>
            <Tag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Aucun code promotionnel</CardTitle>
            <CardDescription>
              Créez votre premier code promo pour booster vos ventes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowCreateForm(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Créer mon premier code promo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
