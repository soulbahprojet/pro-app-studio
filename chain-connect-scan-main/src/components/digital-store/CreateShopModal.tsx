import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Store, Loader2 } from 'lucide-react';

interface CreateShopModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateShop: (shopData: { name: string; description: string; slug: string }) => Promise<void>;
}

export function CreateShopModal({ open, onOpenChange, onCreateShop }: CreateShopModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: ''
  });
  const [loading, setLoading] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) return;

    setLoading(true);
    try {
      await onCreateShop(formData);
      setFormData({ name: '', description: '', slug: '' });
    } catch (error) {
      console.error('Error creating shop:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Créer une nouvelle boutique
          </DialogTitle>
          <DialogDescription>
            Créez votre boutique numérique pour commencer à vendre vos produits.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shop-name">Nom de la boutique</Label>
            <Input
              id="shop-name"
              placeholder="Ex: Ma Boutique Formations"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shop-description">Description</Label>
            <Textarea
              id="shop-description"
              placeholder="Décrivez votre boutique et les types de produits que vous vendez..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shop-slug">URL personnalisée</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">224solutions.com/shop/</span>
              <Input
                id="shop-slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
                placeholder="mon-slug"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              L'URL sera générée automatiquement à partir du nom de votre boutique
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Fonctionnalités incluses :</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Livraison automatique des produits</li>
              <li>• Génération de contenu par IA</li>
              <li>• Système de promotions avancé</li>
              <li>• Analytics détaillées</li>
              <li>• Support multi-devises</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || !formData.name.trim() || !formData.description.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Store className="h-4 w-4 mr-2" />
                  Créer la boutique
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}