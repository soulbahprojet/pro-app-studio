import { supabase } from '@/integrations/supabase/client';

export interface ServiceProvider {
  id: string;
  name: string;
  type: 'courier' | 'taxi_moto' | 'freight';
  latitude: number;
  longitude: number;
  distance?: number;
  rating: number;
  isOnline: boolean;
  estimatedTime?: string;
  phone?: string;
  vehicle_type?: string;
  specializations?: string[];
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// Fonction pour calculer la distance entre deux points (formule haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en kilomètres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Récupérer la position actuelle de l'utilisateur
export async function getCurrentLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Géolocalisation non supportée'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(new Error(`Erreur de géolocalisation: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

// Récupérer les livreurs proches
export async function getNearbyProviders(
  userLocation: UserLocation,
  serviceType: 'courier' | 'taxi_moto' | 'freight' = 'courier',
  maxDistance: number = 10
): Promise<ServiceProvider[]> {
  try {
    let query = supabase
      .from('gps_tracking')
      .select(`
        user_id,
        latitude,
        longitude,
        timestamp,
        profiles:user_id (
          full_name,
          phone,
          role,
          vehicle_type,
          average_rating,
          is_online,
          specializations
        )
      `)
      .eq('is_active', true)
      .gte('timestamp', new Date(Date.now() - 15 * 60 * 1000).toISOString()); // 15 minutes max

    // Filtrer par type de service
    if (serviceType === 'courier') {
      query = query.eq('profiles.role', 'courier');
    } else if (serviceType === 'taxi_moto') {
      query = query.eq('profiles.role', 'taxi_moto');
    } else if (serviceType === 'freight') {
      query = query.eq('profiles.role', 'transitaire');
    }

    const { data, error } = await query;

    if (error) throw error;

    const providers: ServiceProvider[] = data
      .filter((item: any) => item.profiles)
      .map((item: any) => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          item.latitude,
          item.longitude
        );

        return {
          id: item.user_id,
          name: item.profiles.full_name || 'Prestataire',
          type: serviceType,
          latitude: item.latitude,
          longitude: item.longitude,
          distance: Math.round(distance * 100) / 100,
          rating: item.profiles.average_rating || 4.0,
          isOnline: item.profiles.is_online || false,
          estimatedTime: `${Math.ceil(distance * 2)} min`, // Estimation approximative
          phone: item.profiles.phone,
          vehicle_type: item.profiles.vehicle_type,
          specializations: item.profiles.specializations || []
        };
      })
      .filter((provider: ServiceProvider) => provider.distance! <= maxDistance)
      .sort((a: ServiceProvider, b: ServiceProvider) => a.distance! - b.distance!);

    return providers;
  } catch (error) {
    console.error('Erreur lors de la récupération des prestataires:', error);
    return [];
  }
}

// Récupérer les entrepôts de transitaires proches
export async function getNearbyWarehouses(
  userLocation: UserLocation,
  maxDistance: number = 50
): Promise<ServiceProvider[]> {
  try {
    const { data, error } = await supabase
      .from('freight_warehouses_extended')
      .select(`
        id,
        name,
        latitude,
        longitude,
        forwarder_id,
        is_active,
        capacity_m3,
        current_occupancy_m3,
        freight_forwarder_profiles:forwarder_id (
          company_name,
          phone,
          email
        )
      `)
      .eq('is_active', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error) throw error;

    const warehouses: ServiceProvider[] = data
      .map((warehouse: any) => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          warehouse.latitude,
          warehouse.longitude
        );

        return {
          id: warehouse.id,
          name: warehouse.name,
          type: 'freight' as const,
          latitude: warehouse.latitude,
          longitude: warehouse.longitude,
          distance: Math.round(distance * 100) / 100,
          rating: 4.2, // Rating par défaut pour les entrepôts
          isOnline: true,
          estimatedTime: `${Math.ceil(distance / 60)} h`, // Estimation pour transport routier
          phone: warehouse.freight_forwarder_profiles?.phone,
          specializations: [`Capacité: ${warehouse.capacity_m3}m³`]
        };
      })
      .filter((warehouse: ServiceProvider) => warehouse.distance! <= maxDistance)
      .sort((a: ServiceProvider, b: ServiceProvider) => a.distance! - b.distance!);

    return warehouses;
  } catch (error) {
    console.error('Erreur lors de la récupération des entrepôts:', error);
    return [];
  }
}

export const locationService = {
  getCurrentLocation,
  getNearbyProviders,
  getNearbyWarehouses
};