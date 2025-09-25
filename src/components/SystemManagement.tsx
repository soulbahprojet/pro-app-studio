import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Settings, RotateCcw, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function SystemManagement() {
  const [loading, setLoading] = useState(false);
  const { profile, user } = useAuth();

  // Vérification rôle Admin uniquement (PDG est géré séparément)
  if (!user || !profile || profile.role !== 'admin') {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Accès refusé ❌</p>
        </CardContent>
      </Card>
    );
  }

  // Fonction mise à jour
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('system-update', {
        body: { action: 'update' }
      });
      
      if (error) throw error;
      
      toast({
        title: "Mise à jour",
        description: data.message || "Mise à jour lancée avec succès ✅",
      });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour ❌",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  // Fonction restauration (rollback)
  const handleRollback = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('system-rollback', {
        body: { action: 'rollback' }
      });
      
      if (error) throw error;
      
      toast({
        title: "Restauration",
        description: data.message || "Ancien système restauré avec succès ⏪✅",
      });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la restauration ❌",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Gestion du système
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Button
            onClick={handleUpdate}
            disabled={loading}
            className="flex items-center gap-2"
            variant="default"
          >
            <RefreshCw className="h-4 w-4" />
            Mettre à jour
          </Button>

          <Button
            onClick={handleRollback}
            disabled={loading}
            className="flex items-center gap-2"
            variant="destructive"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurer l'ancien système
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
