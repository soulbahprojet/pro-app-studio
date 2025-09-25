import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Star,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Reply,
  Flag,
  ThumbsUp
} from 'lucide-react';

interface Review {
  id: string;
  order_id: string;
  customer_id: string;
  product_id?: string;
  rating: number;
  comment: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  customer_profile?: {
    full_name: string;
    avatar_url?: string;
  };
  product?: {
    name: string;
  };
}

interface ReputationStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  recentTrend: 'up' | 'down' | 'stable';
  responseRate: number;
  reputationScore: number;
}

const ReviewsManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReputationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'responded'>('all');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (user) {
      loadReviews();
      loadReputationStats();
    }
  }, [user, filter, selectedRating]);

  const loadReviews = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('reviews')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (selectedRating) {
        query = query.eq('rating', selectedRating);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Enrichir avec les données utilisateur et produit
      const enrichedReviews = await Promise.all((data || []).map(async (review) => {
        // Récupérer le profil du client
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('user_id', review.customer_id)
          .single();

        // Récupérer le produit si disponible
        let productData = null;
        if (review.product_id) {
          const { data: product } = await supabase
            .from('products')
            .select('name')
            .eq('id', review.product_id)
            .single();
          productData = product;
        }

        return {
          ...review,
          customer_profile: profile,
          product: productData
        };
      }));

      setReviews(enrichedReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les avis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReputationStats = async () => {
    if (!user) return;

    try {
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('rating, created_at')
        .eq('seller_id', user.id);

      if (reviewsData) {
        const totalReviews = reviewsData.length;
        const averageRating = totalReviews > 0 
          ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
          : 0;

        const ratingDistribution = reviewsData.reduce((acc, r) => {
          acc[r.rating] = (acc[r.rating] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);

        // Calculer la tendance (dernier mois vs mois précédent)
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

        const lastMonthReviews = reviewsData.filter(r => new Date(r.created_at) >= lastMonth);
        const previousMonthReviews = reviewsData.filter(r => 
          new Date(r.created_at) >= twoMonthsAgo && new Date(r.created_at) < lastMonth
        );

        const lastMonthAvg = lastMonthReviews.length > 0 
          ? lastMonthReviews.reduce((sum, r) => sum + r.rating, 0) / lastMonthReviews.length 
          : 0;
        const previousMonthAvg = previousMonthReviews.length > 0 
          ? previousMonthReviews.reduce((sum, r) => sum + r.rating, 0) / previousMonthReviews.length 
          : 0;

        let recentTrend: 'up' | 'down' | 'stable' = 'stable';
        if (lastMonthAvg > previousMonthAvg + 0.1) recentTrend = 'up';
        else if (lastMonthAvg < previousMonthAvg - 0.1) recentTrend = 'down';

        // Score de réputation (sur 100)
        const reputationScore = Math.min(100, Math.round(
          (averageRating / 5) * 60 + // 60% basé sur la note moyenne
          (totalReviews > 10 ? 20 : (totalReviews / 10) * 20) + // 20% basé sur le nombre d'avis
          (recentTrend === 'up' ? 20 : recentTrend === 'stable' ? 10 : 0) // 20% basé sur la tendance
        ));

        setStats({
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews,
          ratingDistribution,
          recentTrend,
          responseRate: 85, // TODO: Calculer le taux de réponse réel
          reputationScore
        });
      }
    } catch (error) {
      console.error('Error loading reputation stats:', error);
    }
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;

    try {
      // TODO: Implémenter système de réponse aux avis
      console.log('Reply to review:', reviewId, replyText);
      
      toast({
        title: "Réponse envoyée",
        description: "Votre réponse a été publiée avec succès"
      });
      
      setReplyingTo(null);
      setReplyText('');
    } catch (error) {
      console.error('Error replying to review:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la réponse",
        variant: "destructive"
      });
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${sizeClasses[size]} ${
          i < Math.floor(rating) 
            ? 'text-accent fill-current' 
            : i < rating 
            ? 'text-accent fill-current opacity-50' 
            : 'text-muted-foreground'
        }`}
      />
    ));
  };

  const getReputationColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReputationLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', icon: Award };
    if (score >= 80) return { level: 'Très Bon', icon: CheckCircle };
    if (score >= 60) return { level: 'Bon', icon: ThumbsUp };
    return { level: 'À Améliorer', icon: AlertTriangle };
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistiques de réputation */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-accent/10 to-accent/20 border-accent/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Note Moyenne</CardTitle>
              <Star className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.averageRating}</div>
              <div className="flex items-center mt-2">
                {renderStars(stats.averageRating)}
                <span className="ml-2 text-sm text-muted-foreground">
                  ({stats.totalReviews} avis)
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tendance</CardTitle>
              {stats.recentTrend === 'up' ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : stats.recentTrend === 'down' ? (
                <TrendingDown className="h-5 w-5 text-red-600" />
              ) : (
                <div className="w-5 h-5 bg-muted-foreground rounded-full" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {stats.recentTrend === 'up' ? 'En hausse' : 
                 stats.recentTrend === 'down' ? 'En baisse' : 'Stable'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Comparé au mois dernier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de Réponse</CardTitle>
              <MessageCircle className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.responseRate}%</div>
              <Progress value={stats.responseRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Score Réputation</CardTitle>
              {React.createElement(getReputationLevel(stats.reputationScore).icon, {
                className: `h-5 w-5 ${getReputationColor(stats.reputationScore)}`
              })}
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getReputationColor(stats.reputationScore)}`}>
                {stats.reputationScore}/100
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {getReputationLevel(stats.reputationScore).level}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Gestion des Avis Clients</CardTitle>
          
          {/* Filtres */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filtres:</span>
            </div>
            
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <Button
                  key={rating}
                  variant={selectedRating === rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                  className="flex items-center space-x-1"
                >
                  <Star className={`w-3 h-3 ${selectedRating === rating ? 'fill-current' : ''}`} />
                  <span>{rating}</span>
                </Button>
              ))}
              {selectedRating && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedRating(null)}
                >
                  Tout
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
            <TabsList>
              <TabsTrigger value="all">Tous les avis ({reviews.length})</TabsTrigger>
              <TabsTrigger value="pending">
                À répondre ({reviews.filter(r => !r.comment).length})
              </TabsTrigger>
              <TabsTrigger value="responded">Avec réponse</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="space-y-4 mt-6">
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Aucun avis disponible</h3>
                  <p className="text-muted-foreground">
                    Les avis de vos clients apparaîtront ici
                  </p>
                </div>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id} className="relative">
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src={review.customer_profile?.avatar_url} />
                          <AvatarFallback>
                            {review.customer_profile?.full_name?.charAt(0) || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-3">
                          {/* En-tête de l'avis */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">
                                  {review.customer_profile?.full_name || 'Client'}
                                </span>
                                {review.is_verified && (
                                  <Badge variant="secondary" className="text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Vérifié
                                  </Badge>
                                )}
                              </div>
                              {review.product && (
                                <p className="text-sm text-muted-foreground">
                                  Produit: {review.product.name}
                                </p>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center space-x-1">
                                {renderStars(review.rating)}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>

                          {/* Commentaire */}
                          {review.comment && (
                            <div className="bg-muted/30 rounded-lg p-4">
                              <p className="text-sm">{review.comment}</p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            {replyingTo === review.id ? (
                              <div className="w-full space-y-3">
                                <Textarea
                                  placeholder="Répondre à cet avis..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  rows={3}
                                />
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleReply(review.id)}
                                  >
                                    Publier
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => {
                                      setReplyingTo(null);
                                      setReplyText('');
                                    }}
                                  >
                                    Annuler
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setReplyingTo(review.id)}
                                className="flex items-center space-x-2"
                              >
                                <Reply className="w-4 h-4" />
                                <span>Répondre</span>
                              </Button>
                            )}

                            <Button size="sm" variant="ghost">
                              <Flag className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Distribution des notes */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Distribution des Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = stats.ratingDistribution[rating] || 0;
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center space-x-4">
                    <div className="flex items-center w-16">
                      <span className="text-sm w-3">{rating}</span>
                      <Star className="w-4 h-4 text-accent fill-current ml-1" />
                    </div>
                    <Progress value={percentage} className="flex-1" />
                    <div className="w-16 text-right">
                      <span className="text-sm text-muted-foreground">{count}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReviewsManagement;