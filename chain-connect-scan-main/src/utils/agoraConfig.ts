import { supabase } from '@/integrations/supabase/client';

export interface AgoraTokenResponse {
  success: boolean;
  token?: string;
  appId?: string;
  channelName?: string;
  uid?: string;
  role?: string;
  expiresAt?: number;
  expiresIn?: number;
  generatedAt?: number;
  error?: string;
}

export class AgoraService {
  /**
   * Generate Agora token for joining a channel
   * @param channelName - Name of the channel to join
   * @param uid - User ID (string or number)
   * @param role - User role (1 = PUBLISHER, 2 = SUBSCRIBER)
   * @returns Promise with token and configuration
   */
  static async generateToken(
    channelName: string, 
    uid: string | number, 
    role: 'publisher' | 'subscriber' = 'publisher',
    expireIn?: number
  ): Promise<AgoraTokenResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('agora-token', {
        body: {
          channelName,
          uid: uid.toString(),
          role,
          expireIn: expireIn || 3600 // 1 heure par défaut
        }
      });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Failed to invoke agora-token function');
      }

      if (!data.success) {
        throw new Error(data.error || 'Token generation failed');
      }

      return data;
    } catch (error) {
      console.error('Error generating Agora token:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Test connection to a specific channel
   * @param channelName - Channel to test
   * @param uid - User ID for testing
   * @returns Promise indicating success/failure
   */
  static async testConnection(channelName: string, uid: string): Promise<boolean> {
    try {
      const result = await this.generateToken(channelName, uid, 'publisher');
      return result.success;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Log call events to Firebase for analytics
   * @param eventType - Type of event (call_started, call_ended, etc.)
   * @param data - Event data
   */
  static async logCallEvent(eventType: string, data: any): Promise<void> {
    try {
      // This will be handled by the calling component since it needs Firebase context
      console.log(`Call event: ${eventType}`, data);
    } catch (error) {
      console.error('Error logging call event:', error);
    }
  }
}

// Constants for Agora configuration
export const AGORA_CONFIG = {
  // Default channel for testing
  TEST_CHANNEL: '224solutions-test',
  
  // User roles (nouvelles chaînes pour plus de clarté)
  ROLES: {
    PUBLISHER: 'publisher',   // Can send and receive audio/video
    SUBSCRIBER: 'subscriber'  // Can only receive audio/video
  },
  
  // Token expiration (1 heure par défaut en secondes)
  TOKEN_EXPIRATION: 3600,
  
  // Video configuration
  VIDEO_CONFIG: {
    width: 640,
    height: 480,
    frameRate: 15,
    bitrateMin: 200,
    bitrateMax: 1000
  },
  
  // Audio configuration
  AUDIO_CONFIG: {
    sampleRate: 48000,
    sampleSize: 16,
    stereo: true
  }
};

export default AgoraService;