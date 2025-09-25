import { supabase } from '@/integrations/supabase/client';

// Mapbox token management service
export class MapboxService {
  private static webToken: string | null = null;
  private static androidToken: string | null = null;
  private static iOSToken: string | null = null;

  // Get appropriate token based on platform
  static async getToken(platform: 'web' | 'android' | 'ios' = 'web'): Promise<string> {
    try {
      const tokenName = `MAPBOX_ACCESS_TOKEN_${platform.toUpperCase()}`;
      
      // Check if we have cached token
      const cachedToken = this.getCachedToken(platform);
      if (cachedToken) return cachedToken;

      // Fetch from Supabase edge function (secrets)
      const { data, error } = await supabase.functions.invoke('mapbox-token', {
        body: { platform }
      });

      if (error) {
        console.error('Error fetching Mapbox token:', error);
        // Fallback to localStorage for development
        return this.getFallbackToken() || '';
      }

      if (data?.token) {
        this.setCachedToken(platform, data.token);
        return data.token;
      }

      return this.getFallbackToken() || '';
    } catch (error) {
      console.error('Error in getToken:', error);
      return this.getFallbackToken() || '';
    }
  }

  private static getCachedToken(platform: 'web' | 'android' | 'ios'): string | null {
    switch (platform) {
      case 'web': return this.webToken;
      case 'android': return this.androidToken;
      case 'ios': return this.iOSToken;
      default: return null;
    }
  }

  private static setCachedToken(platform: 'web' | 'android' | 'ios', token: string): void {
    switch (platform) {
      case 'web': this.webToken = token; break;
      case 'android': this.androidToken = token; break;
      case 'ios': this.iOSToken = token; break;
    }
  }

  private static getFallbackToken(): string | null {
    // For development/fallback - check localStorage
    return localStorage.getItem('mapbox_token');
  }

  // Store token locally for development
  static setFallbackToken(token: string): void {
    localStorage.setItem('mapbox_token', token);
  }

  // Geocoding service
  static async geocodeAddress(address: string): Promise<{
    coordinates: [number, number];
    formattedAddress: string;
  } | null> {
    try {
      const token = await this.getToken('web');
      if (!token) return null;

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&country=GN,CI,SN,ML,BF&language=fr`
      );

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        return {
          coordinates: feature.center,
          formattedAddress: feature.place_name
        };
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  // Reverse geocoding
  static async reverseGeocode(lng: number, lat: number): Promise<string | null> {
    try {
      const token = await this.getToken('web');
      if (!token) return null;

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&language=fr`
      );

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }

      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  // Directions service
  static async getDirections(
    start: [number, number],
    end: [number, number],
    profile: 'driving' | 'walking' | 'cycling' = 'driving'
  ): Promise<{
    route: any;
    distance: number;
    duration: number;
    geometry: any;
  } | null> {
    try {
      const token = await this.getToken('web');
      if (!token) return null;

      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start[0]},${start[1]};${end[0]},${end[1]}?access_token=${token}&geometries=geojson&language=fr&steps=true`
      );

      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          route: route,
          distance: route.distance,
          duration: route.duration,
          geometry: route.geometry
        };
      }

      return null;
    } catch (error) {
      console.error('Directions error:', error);
      return null;
    }
  }

  // Distance Matrix for multiple points
  static async getDistanceMatrix(
    origins: [number, number][],
    destinations: [number, number][],
    profile: 'driving' | 'walking' | 'cycling' = 'driving'
  ): Promise<any> {
    try {
      const token = await this.getToken('web');
      if (!token) return null;

      const coordinates = [...origins, ...destinations]
        .map(coord => `${coord[0]},${coord[1]}`)
        .join(';');

      const response = await fetch(
        `https://api.mapbox.com/directions-matrix/v1/mapbox/${profile}/${coordinates}?access_token=${token}&sources=0;${origins.length - 1}&destinations=${origins.length};${origins.length + destinations.length - 1}`
      );

      return await response.json();
    } catch (error) {
      console.error('Distance matrix error:', error);
      return null;
    }
  }

  // Places autocomplete
  static async searchPlaces(query: string, proximity?: [number, number]): Promise<any[]> {
    try {
      const token = await this.getToken('web');
      if (!token) return [];

      let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&country=GN,CI,SN,ML,BF&language=fr&limit=5`;
      
      if (proximity) {
        url += `&proximity=${proximity[0]},${proximity[1]}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      return data.features || [];
    } catch (error) {
      console.error('Places search error:', error);
      return [];
    }
  }
}

export default MapboxService;