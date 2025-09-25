import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Award, Star, Trophy } from 'lucide-react';

interface CourierBadge {
  id: string;
  badge_type: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned_at: string;
  is_active: boolean;
}

export default function BadgeDisplay() {
  const { profile } = useAuth();
  const [badges, setBadges] = useState<CourierBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadBadges();
      checkAndAssignBadges();
    }
  }, [profile]);

  const loadBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('courier_id', profile?.user_id)
        .eq('is_active', true)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAndAssignBadges = async () => {
    try {
      // Appeler la fonction pour vérifier et attribuer les badges
      const { error } = await supabase.rpc('check_and_assign_badges', {
        p_courier_id: profile?.user_id
      });

      if (error) {
        console.error('Erreur lors de la vérification des badges:', error);
      } else {
        // Recharger les badges après vérification
        setTimeout(loadBadges, 1000);
      }
    } catch (error) {
      console.error('Erreur lors de l\'attribution des badges:', error);
    }
  };

  const getBadgeIcon = (badgeType: string, icon?: string) => {
    if (icon) return icon;
    
    switch (badgeType) {
      case 'speed': return '⚡';
      case 'reliability': return '🛡️';
      case 'missions': return '🏆';
      case 'excellence': return '💎';
      case 'veteran': return '👑';
      default: return '🏅';
    }
  };

  const getBadgeGradient = (color: string) => {
    const colorMap: Record<string, string> = {
      '#F59E0B': 'from-amber-400 to-orange-500',
      '#10B981': 'from-emerald-400 to-green-500',
      '#8B5CF6': 'from-purple-400 to-violet-500',
      '#EF4444': 'from-red-400 to-rose-500',
      '#DC2626': 'from-red-600 to-red-700',
    };
    return colorMap[color] || 'from-blue-400 to-blue-500';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Chargement des badges...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Mes Badges de Performance
        </CardTitle>
        <CardDescription>
          Badges obtenus selon vos performances de livraison
        </CardDescription>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-muted-foreground">Aucun badge obtenu pour le moment</p>
              <p className="text-sm text-muted-foreground mt-1">
                Continuez à livrer pour débloquer vos premiers badges !
              </p>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Badges disponibles :</strong></p>
              <ul className="space-y-1">
                <li>⚡ <strong>Éclair</strong> - 10+ missions avec 95%+ de succès</li>
                <li>🛡️ <strong>Fiable</strong> - 20+ missions avec note 4.5+</li>
                <li>🏆 <strong>Expert</strong> - 50+ missions complétées</li>
                <li>💎 <strong>Excellence</strong> - 100+ missions, 98%+ succès, 4.8+ note</li>
                <li>👑 <strong>Vétéran</strong> - 500+ missions complétées</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div 
                key={badge.id}
                className={`relative p-6 rounded-xl bg-gradient-to-br ${getBadgeGradient(badge.color)} text-white shadow-lg overflow-hidden`}
              >
                <div className="absolute top-2 right-2 opacity-20 text-4xl">
                  {getBadgeIcon(badge.badge_type, badge.icon)}
                </div>
                <div className="relative z-10">
                  <div className="text-2xl mb-2">
                    {getBadgeIcon(badge.badge_type, badge.icon)}
                  </div>
                  <h3 className="font-bold text-lg">{badge.name}</h3>
                  <p className="text-sm opacity-90 mb-3">{badge.description}</p>
                  <div className="text-xs opacity-75">
                    Obtenu le {new Date(badge.earned_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full"></div>
              </div>
            ))}
          </div>
        )}

        {/* Statistiques actuelles */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-3">Vos statistiques actuelles</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-lg">{(profile as any)?.total_missions || 0}</div>
              <div className="text-muted-foreground">Missions totales</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{(profile as any)?.completed_missions || 0}</div>
              <div className="text-muted-foreground">Complétées</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{(profile as any)?.success_rate || 0}%</div>
              <div className="text-muted-foreground">Taux de succès</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{(profile as any)?.average_rating || 0}/5</div>
              <div className="text-muted-foreground">Note moyenne</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}