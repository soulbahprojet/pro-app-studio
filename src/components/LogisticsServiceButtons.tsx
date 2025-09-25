import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Globe, Users, Truck, ChevronRight, Navigation2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const LogisticsServiceButtons = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const handleInternationalClick = () => {
    toast({
      title: "🌍 Transitaires Internationaux",
      description: "Accès à la liste des transitaires disponibles"
    });
  };

  const handleLocalCouriersClick = async () => {
    try {
      const { data: currentUser, error: userError } = await supabase
        .from('profiles')
        .select('country')
        .eq('user_id', user?.id)
        .single();

      if (userError) throw userError;

      const userCountry = currentUser?.country;

      if (!userCountry) {
        toast({
          title: "❌ Pays non défini",
          description: "Veuillez mettre à jour votre profil avec votre pays",
          variant: "destructive"
        });
        return;
      }
      
      const { data: forwarders, error } = await supabase
        .from('freight_forwarder_profiles')
        .select(`
          id,
          company_name,
          country,
          city,
          phone,
          email,
          is_active,
          is_verified
        `)
        .eq('country', userCountry)
        .eq('is_active', true)
        .eq('is_verified', true)
        .order('company_name', { ascending: true });

      if (error) throw error;

      const forwardersList = forwarders?.map((f, index) => 
        `${index + 1}. ${f.company_name} - ${f.city} 📞 ${f.phone}`
      ).join('\n') || "Aucun transitaire trouvé dans votre pays";

      toast({
        title: `🌍 Tous les Transitaires - ${userCountry}`,
        description: forwardersList,
        duration: 10000
      });

    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les transitaires du pays",
        variant: "destructive"
      });
    }
  };

  const handleRealtimeClick = async () => {
    try {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        
        const { data: couriers, error } = await supabase
          .from('profiles')
          .select(`
            user_id,
            full_name,
            role,
            country,
            address,
            phone,
            vehicle_type,
            vest_number,
            is_verified,
            gps_verified
          `)
          .in('role', ['courier', 'taxi_moto'])
          .eq('is_verified', true)
          .eq('gps_verified', true);

        if (error) throw error;

        const couriersList = couriers?.filter(c => c.role === 'courier') || [];
        const taxiMotoList = couriers?.filter(c => c.role === 'taxi_moto') || [];
        
        const sortByProximity = (a, b) => {
          if (a.country === b.country) {
            return a.address?.localeCompare(b.address || '') || 0;
          }
          return a.country?.localeCompare(b.country || '') || 0;
        };

        couriersList.sort(sortByProximity);
        taxiMotoList.sort(sortByProximity);

        let displayList = "";
        
        if (couriersList.length > 0) {
          displayList += "🚚 LIVREURS:\n";
          couriersList.slice(0, 3).forEach((c, index) => {
            displayList += `${index + 1}. ${c.full_name} (${c.vest_number}) - ${c.address}, ${c.country}\n`;
          });
        }
        
        if (taxiMotoList.length > 0) {
          displayList += "\n🏍️ TAXI-MOTO:\n";
          taxiMotoList.slice(0, 3).forEach((t, index) => {
            displayList += `${index + 1}. ${t.full_name} (${t.vest_number}) - ${t.address}, ${t.country}\n`;
          });
        }

        if (!displayList) {
          displayList = "Aucun livreur ou taxi-moto disponible dans votre zone";
        }

        toast({
          title: "🚚🏍️ Livreurs & Taxi-Moto Disponibles",
          description: displayList,
          duration: 10000
        });
        
      }, (error) => {
        toast({
          title: "📍 Géolocalisation indisponible", 
          description: "Affichage des livreurs par ordre alphabétique",
          variant: "destructive"
        });
      });
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les livreurs",
        variant: "destructive"
      });
    }
  };

  return null;
};

export default LogisticsServiceButtons;
