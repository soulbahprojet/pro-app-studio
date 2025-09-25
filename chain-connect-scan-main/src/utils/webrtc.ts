// Service WebRTC pour les appels audio/vidéo sécurisés

export interface CallSession {
  id: string;
  type: 'audio' | 'video';
  status: 'connecting' | 'ringing' | 'active' | 'ended';
  localStream?: MediaStream;
  remoteStream?: MediaStream;
  peerConnection?: RTCPeerConnection;
  startTime?: Date;
}

export interface CallEventHandlers {
  onCallStarted?: (session: CallSession) => void;
  onCallConnected?: (session: CallSession) => void;
  onCallEnded?: (session: CallSession) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onError?: (error: string) => void;
}

export class WebRTCService {
  private static instance: WebRTCService;
  private currentSession: CallSession | null = null;
  private handlers: CallEventHandlers = {};
  
  // Configuration STUN/TURN pour la connexion P2P
  private readonly rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      // En production, ajouter des serveurs TURN pour traverser les NAT/firewalls
      // {
      //   urls: 'turn:your-turn-server.com:3478',
      //   username: 'username',
      //   credential: 'password'
      // }
    ],
  };

  private constructor() {}

  public static getInstance(): WebRTCService {
    if (!WebRTCService.instance) {
      WebRTCService.instance = new WebRTCService();
    }
    return WebRTCService.instance;
  }

  /**
   * Configure les handlers d'événements
   */
  setEventHandlers(handlers: CallEventHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Démarre un appel sortant
   */
  async startCall(contactId: string, type: 'audio' | 'video'): Promise<CallSession> {
    try {
      // Vérifier si un appel est déjà en cours
      if (this.currentSession) {
        throw new Error('Un appel est déjà en cours');
      }

      // Créer une nouvelle session
      const session: CallSession = {
        id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        status: 'connecting'
      };

      // Obtenir l'accès aux médias
      const mediaConstraints: MediaStreamConstraints = {
        audio: true,
        video: type === 'video'
      };

      try {
        session.localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      } catch (mediaError) {
        throw new Error('Impossible d\'accéder au microphone/caméra');
      }

      // Créer la connexion peer-to-peer
      session.peerConnection = new RTCPeerConnection(this.rtcConfiguration);

      // Ajouter les tracks locaux
      session.localStream.getTracks().forEach(track => {
        if (session.peerConnection && session.localStream) {
          session.peerConnection.addTrack(track, session.localStream);
        }
      });

      // Configurer les handlers de connexion
      this.setupPeerConnectionHandlers(session);

      this.currentSession = session;
      this.handlers.onCallStarted?.(session);

      // Créer et envoyer l'offre
      const offer = await session.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: type === 'video'
      });

      await session.peerConnection.setLocalDescription(offer);

      // Ici, dans un vrai système, on enverrait l'offre via le serveur de signaling
      // Pour la démo, on simule une réponse automatique
      this.simulateCallResponse(session);

      return session;
    } catch (error) {
      this.handlers.onError?.(error instanceof Error ? error.message : 'Erreur inconnue');
      throw error;
    }
  }

  /**
   * Accepte un appel entrant
   */
  async acceptCall(offer: RTCSessionDescriptionInit, type: 'audio' | 'video'): Promise<CallSession> {
    try {
      const session: CallSession = {
        id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        status: 'connecting'
      };

      // Obtenir l'accès aux médias
      const mediaConstraints: MediaStreamConstraints = {
        audio: true,
        video: type === 'video'
      };

      session.localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      session.peerConnection = new RTCPeerConnection(this.rtcConfiguration);

      // Ajouter les tracks locaux
      session.localStream.getTracks().forEach(track => {
        if (session.peerConnection && session.localStream) {
          session.peerConnection.addTrack(track, session.localStream);
        }
      });

      this.setupPeerConnectionHandlers(session);

      // Définir la description distante et créer une réponse
      await session.peerConnection.setRemoteDescription(offer);
      const answer = await session.peerConnection.createAnswer();
      await session.peerConnection.setLocalDescription(answer);

      this.currentSession = session;
      return session;
    } catch (error) {
      this.handlers.onError?.(error instanceof Error ? error.message : 'Erreur acceptation appel');
      throw error;
    }
  }

  /**
   * Termine l'appel en cours
   */
  async endCall(): Promise<void> {
    if (!this.currentSession) {
      return;
    }

    try {
      // Fermer la connexion peer-to-peer
      if (this.currentSession.peerConnection) {
        this.currentSession.peerConnection.close();
      }

      // Arrêter les streams locaux
      if (this.currentSession.localStream) {
        this.currentSession.localStream.getTracks().forEach(track => {
          track.stop();
        });
      }

      // Calculer la durée si l'appel était actif
      if (this.currentSession.startTime) {
        const duration = (Date.now() - this.currentSession.startTime.getTime()) / 1000;
        console.log(`Appel terminé - Durée: ${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`);
      }

      this.currentSession.status = 'ended';
      this.handlers.onCallEnded?.(this.currentSession);
      
      this.currentSession = null;
    } catch (error) {
      console.error('Erreur fin d\'appel:', error);
    }
  }

  /**
   * Bascule le microphone (mute/unmute)
   */
  toggleMicrophone(): boolean {
    if (!this.currentSession?.localStream) {
      return false;
    }

    const audioTracks = this.currentSession.localStream.getAudioTracks();
    if (audioTracks.length > 0) {
      audioTracks[0].enabled = !audioTracks[0].enabled;
      return audioTracks[0].enabled;
    }

    return false;
  }

  /**
   * Bascule la caméra (show/hide)
   */
  toggleCamera(): boolean {
    if (!this.currentSession?.localStream) {
      return false;
    }

    const videoTracks = this.currentSession.localStream.getVideoTracks();
    if (videoTracks.length > 0) {
      videoTracks[0].enabled = !videoTracks[0].enabled;
      return videoTracks[0].enabled;
    }

    return false;
  }

  /**
   * Obtient le stream local actuel
   */
  getLocalStream(): MediaStream | null {
    return this.currentSession?.localStream || null;
  }

  /**
   * Obtient le stream distant actuel
   */
  getRemoteStream(): MediaStream | null {
    return this.currentSession?.remoteStream || null;
  }

  /**
   * Obtient l'état de l'appel en cours
   */
  getCurrentSession(): CallSession | null {
    return this.currentSession;
  }

  /**
   * Configure les handlers de la connexion peer-to-peer
   */
  private setupPeerConnectionHandlers(session: CallSession): void {
    if (!session.peerConnection) return;

    // Handler pour les nouveaux streams distants
    session.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        session.remoteStream = event.streams[0];
        this.handlers.onRemoteStream?.(event.streams[0]);
      }
    };

    // Handler pour les changements d'état de connexion
    session.peerConnection.onconnectionstatechange = () => {
      if (!session.peerConnection) return;

      switch (session.peerConnection.connectionState) {
        case 'connected':
          session.status = 'active';
          session.startTime = new Date();
          this.handlers.onCallConnected?.(session);
          break;
        case 'disconnected':
        case 'failed':
        case 'closed':
          this.endCall();
          break;
      }
    };

    // Handler pour les candidats ICE
    session.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Ici, dans un vrai système, on enverrait le candidat via le serveur de signaling
        console.log('Nouveau candidat ICE:', event.candidate);
      }
    };

    // Handler pour les changements d'état ICE
    session.peerConnection.oniceconnectionstatechange = () => {
      if (!session.peerConnection) return;
      console.log('État de connexion ICE:', session.peerConnection.iceConnectionState);
    };
  }

  /**
   * Simule une réponse d'appel pour la démo
   */
  private async simulateCallResponse(session: CallSession): Promise<void> {
    // Simuler le délai de connexion
    setTimeout(() => {
      session.status = 'ringing';
    }, 1000);

    // Simuler l'acceptation de l'appel
    setTimeout(async () => {
      if (!session.peerConnection) return;

      try {
        // Créer une réponse simulée
        const answer: RTCSessionDescriptionInit = {
          type: 'answer',
          sdp: 'v=0\r\n' // SDP simulé très basique
        };

        // Dans un vrai système, cette réponse viendrait du pair distant
        // await session.peerConnection.setRemoteDescription(answer);
        
        // Pour la démo, on simule juste l'état connecté
        session.status = 'active';
        session.startTime = new Date();
        this.handlers.onCallConnected?.(session);
      } catch (error) {
        console.error('Erreur simulation réponse:', error);
        this.handlers.onError?.('Échec de connexion de l\'appel');
      }
    }, 3000);
  }

  /**
   * Vérifie la compatibilité WebRTC du navigateur
   */
  static checkWebRTCSupport(): { supported: boolean; missing: string[] } {
    const missing: string[] = [];

    if (!navigator.mediaDevices) {
      missing.push('MediaDevices API');
    }
    
    if (!navigator.mediaDevices?.getUserMedia) {
      missing.push('getUserMedia');
    }

    if (!window.RTCPeerConnection) {
      missing.push('RTCPeerConnection');
    }

    if (!window.RTCSessionDescription) {
      missing.push('RTCSessionDescription');
    }

    if (!window.RTCIceCandidate) {
      missing.push('RTCIceCandidate');
    }

    return {
      supported: missing.length === 0,
      missing
    };
  }

  /**
   * Obtient les périphériques média disponibles
   */
  static async getAvailableDevices(): Promise<{
    audioInputs: MediaDeviceInfo[];
    videoInputs: MediaDeviceInfo[];
    audioOutputs: MediaDeviceInfo[];
  }> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      return {
        audioInputs: devices.filter(device => device.kind === 'audioinput'),
        videoInputs: devices.filter(device => device.kind === 'videoinput'),
        audioOutputs: devices.filter(device => device.kind === 'audiooutput')
      };
    } catch (error) {
      console.error('Erreur énumération périphériques:', error);
      return { audioInputs: [], videoInputs: [], audioOutputs: [] };
    }
  }
}

// Instance singleton
export const webRTCService = WebRTCService.getInstance();

// Hook React pour utiliser WebRTC facilement
export const useWebRTC = () => {
  const [currentCall, setCurrentCall] = React.useState<CallSession | null>(null);
  const [isCallSupported, setIsCallSupported] = React.useState(false);

  React.useEffect(() => {
    // Vérifier le support WebRTC
    const support = WebRTCService.checkWebRTCSupport();
    setIsCallSupported(support.supported);

    // Configurer les handlers
    webRTCService.setEventHandlers({
      onCallStarted: (session) => setCurrentCall(session),
      onCallConnected: (session) => setCurrentCall(session),
      onCallEnded: () => setCurrentCall(null),
      onError: (error) => console.error('Erreur WebRTC:', error)
    });

    return () => {
      // Nettoyer à la fermeture du composant
      if (currentCall) {
        webRTCService.endCall();
      }
    };
  }, []);

  const startCall = async (contactId: string, type: 'audio' | 'video') => {
    try {
      const session = await webRTCService.startCall(contactId, type);
      return session;
    } catch (error) {
      console.error('Erreur démarrage appel:', error);
      throw error;
    }
  };

  const endCall = () => {
    webRTCService.endCall();
  };

  const toggleMicrophone = () => {
    return webRTCService.toggleMicrophone();
  };

  const toggleCamera = () => {
    return webRTCService.toggleCamera();
  };

  return {
    currentCall,
    isCallSupported,
    startCall,
    endCall,
    toggleMicrophone,
    toggleCamera
  };
};

// Types React
declare global {
  namespace React {
    function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
    function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  }
}