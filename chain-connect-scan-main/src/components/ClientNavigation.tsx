import React, { useState } from 'react';
import UberStyleInterface from './delivery/UberStyleInterface';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Home,
  Grid3X3,
  MessageCircle,
  Truck,
  User,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  Search,
  Plus,
  History,
  Phone,
  Ship,
  Store
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const ClientNavigation = () => {
  const location = useLocation();
  const [universalTrackingOpen, setUniversalTrackingOpen] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const { toast } = useToast();

  const handleUniversalTracking = async () => {
    if (!trackingId.trim()) {
      toast({
        title: "❌ ID requis",
        description: "Veuillez entrer un ID à tracker",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    
    try {
      // SÉCURITÉ: Les clients ne peuvent rechercher QUE les livreurs publics
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          role,
          country,
          address,
          phone,
          vest_number,
          vehicle_type,
          is_verified,
          gps_verified,
          readable_id
        `)
        .or(`readable_id.eq.${trackingId.toUpperCase()},vest_number.eq.${trackingId}`)
        .in('role', ['courier', 'taxi_moto'])
        .eq('is_verified', true)
        .limit(5);

      if (profileError) throw profileError;

      if (profileData && profileData.length > 0) {
        const results = profileData.map(profile => ({
          type: profile.role,
          id: profile.user_id,
          name: profile.full_name,
          info: profile.role === 'courier' || profile.role === 'taxi_moto' 
            ? `${profile.role.toUpperCase()} #${profile.vest_number} - ${profile.vehicle_type || 'N/A'}`
            : `${profile.role.toUpperCase()}`,
          location: `${profile.address}, ${profile.country}`,
          phone: profile.phone,
          verified: profile.is_verified && profile.gps_verified,
          readableId: profile.readable_id
        }));

        setTrackingResult({
          found: true,
          data: results,
          searchType: 'profiles'
        });

        toast({
          title: "✅ Utilisateur(s) trouvé(s)",
          description: `${results.length} résultat(s) pour "${trackingId}"`,
        });
      } else {
        setTrackingResult({
          found: false,
          data: [],
          searchType: 'none'
        });

        toast({
          title: "❌ Aucun résultat",
          description: `Aucun utilisateur trouvé avec l'ID "${trackingId}"`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur tracking:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible d'effectuer la recherche",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const navigationItems = [
    { icon: Home, label: "Accueil", path: "/services" },
    { icon: Store, label: "Marketplace", path: "/" },
    { icon: MapPin, label: "Tracking", path: "/order-tracking" },
    { icon: User, label: "Profil", path: "/profile" }
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-[99999] shadow-lg backdrop-blur-sm !important">
        <div className="grid grid-cols-4 py-1 px-2 justify-items-center max-w-4xl mx-auto gap-2">
          {navigationItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            
            if (item.path === '/order-tracking') {
              return (
                <Dialog key={index} open={universalTrackingOpen} onOpenChange={setUniversalTrackingOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`flex flex-col items-center py-1 px-2 h-auto space-y-1 relative w-full ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5 text-primary" />
                        Tracking Universel
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">ID à tracker</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="ID Utilisateur, Vest #, Code..."
                            value={trackingId}
                            onChange={(e) => setTrackingId(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleUniversalTracking()}
                          />
                          <Button 
                            onClick={handleUniversalTracking}
                            disabled={isSearching}
                            className="whitespace-nowrap"
                          >
                            {isSearching ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Recherche...</span>
                              </div>
                            ) : (
                              <>
                                <Search className="w-4 h-4 mr-2" />
                                Tracker
                              </>
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Entrez un ID utilisateur, numéro de gilet, ou code lisible
                        </p>
                      </div>

                      {trackingResult && (
                        <Card className="mt-4">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              {trackingResult.found ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  Résultats trouvés
                                </>
                              ) : (
                                <>
                                  <History className="w-4 h-4 text-orange-500" />
                                  Aucun résultat
                                </>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            {trackingResult.found && trackingResult.data.length > 0 ? (
                              <div className="space-y-3">
                                {trackingResult.data.map((result, idx) => (
                                  <div key={idx} className="border rounded-lg p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-sm">{result.name}</span>
                                      <Badge variant={result.verified ? "default" : "secondary"}>
                                        {result.verified ? "✅ Vérifié" : "⏳ En attente"}
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      <div className="flex items-center gap-2">
                                        <Truck className="w-3 h-3" />
                                        <span>{result.info}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-3 h-3" />
                                        <span>{result.location}</span>
                                      </div>
                                      {result.phone && (
                                        <div className="flex items-center gap-2">
                                          <Phone className="w-3 h-3" />
                                          <span>{result.phone}</span>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-2">
                                        <Package className="w-3 h-3" />
                                        <span>ID: {result.readableId}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Aucun utilisateur trouvé avec cet ID
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              );
            }
            
            return (
              <Link key={index} to={item.path}>
                <Button
                  variant="ghost"
                  className={`flex flex-col items-center py-1 px-2 h-auto space-y-1 relative w-full transition-all duration-200 hover:bg-primary/10 active:scale-95 ${
                    isActive 
                      ? 'text-primary bg-primary/5 border border-primary/20' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                  onClick={() => {
                    // Feedback haptique léger sur mobile
                    if ('vibrate' in navigator) {
                      navigator.vibrate(50);
                    }
                  }}
                  aria-label={`Naviguer vers ${item.label}`}
                  role="button"
                  tabIndex={0}
                >
                  <item.icon className={`h-4 w-4 transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'hover:scale-105'
                  }`} />
                  <span className={`text-xs font-medium transition-all duration-200 ${
                    isActive ? 'font-semibold' : ''
                  }`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ClientNavigation;