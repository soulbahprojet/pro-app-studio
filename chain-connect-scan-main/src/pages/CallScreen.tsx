import React, { useState, useEffect, useRef } from 'react';
import AgoraRTC, { 
  IAgoraRTCClient, 
  ICameraVideoTrack, 
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack
} from 'agora-rtc-sdk-ng';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff } from 'lucide-react';
import { firestore } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Agora configuration
AgoraRTC.setLogLevel(4); // Info level logging

interface CallScreenProps {
  channelName?: string;
  onCallEnd?: () => void;
}

const CallScreen: React.FC<CallScreenProps> = ({ 
  channelName = "224solutions-test", 
  onCallEnd 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Agora states
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  
  // UI states
  const [isJoined, setIsJoined] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Refs for video containers
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    initializeAgora();
    return () => {
      cleanup();
    };
  }, []);

  const initializeAgora = () => {
    const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    
    // Handle remote user events
    agoraClient.on('user-published', handleUserPublished);
    agoraClient.on('user-unpublished', handleUserUnpublished);
    agoraClient.on('user-left', handleUserLeft);
    
    setClient(agoraClient);
    console.log('Agora client initialized');
  };

  const handleUserPublished = async (user: any, mediaType: 'video' | 'audio') => {
    if (!client) return;
    
    await client.subscribe(user, mediaType);
    console.log(`Subscribed to user ${user.uid} for ${mediaType}`);
    
    if (mediaType === 'video') {
      const remoteVideoTrack = user.videoTrack as IRemoteVideoTrack;
      const container = remoteVideoRefs.current[user.uid];
      if (container && remoteVideoTrack) {
        remoteVideoTrack.play(container);
      }
    }
    
    if (mediaType === 'audio') {
      const remoteAudioTrack = user.audioTrack as IRemoteAudioTrack;
      remoteAudioTrack?.play();
    }
    
    setRemoteUsers(prev => {
      const existing = prev.find(u => u.uid === user.uid);
      if (existing) {
        return prev.map(u => u.uid === user.uid ? user : u);
      }
      return [...prev, user];
    });
  };

  const handleUserUnpublished = (user: any, mediaType: 'video' | 'audio') => {
    console.log(`User ${user.uid} unpublished ${mediaType}`);
  };

  const handleUserLeft = (user: any) => {
    console.log(`User ${user.uid} left the channel`);
    setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
  };

  const joinChannel = async () => {
    if (!client || !user) {
      toast({
        title: "Erreur",
        description: "Client non initialisé ou utilisateur non connecté",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);

    try {
      // Get Agora token from our Edge Function
      const { data, error } = await supabase.functions.invoke('agora-token', {
        body: {
          channelName,
          uid: user.id,
          role: 'publisher', // Using string role
          expireIn: 3600 // 1 heure
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to get token');
      }

      console.log('Token received, joining channel...');

      // Create local tracks
      const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalAudioTrack(microphoneTrack);
      setLocalVideoTrack(cameraTrack);

      // Play local video
      if (localVideoRef.current && cameraTrack) {
        cameraTrack.play(localVideoRef.current);
      }

      // Join channel
      await client.join(data.appId, channelName, data.token, user.id);
      
      // Publish local tracks
      await client.publish([microphoneTrack, cameraTrack]);
      
      setIsJoined(true);
      
      // Log call start in Firebase
      await logCallEvent('call_started', {
        channelName,
        participantId: user.id,
        timestamp: Date.now()
      });

      toast({
        title: "Connexion réussie",
        description: `Connecté au canal ${channelName}`,
      });

      console.log('Successfully joined channel:', channelName);
    } catch (error) {
      console.error('Error joining channel:', error);
      toast({
        title: "Erreur de connexion",
        description: error instanceof Error ? error.message : 'Impossible de rejoindre l\'appel',
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const leaveChannel = async () => {
    if (!client) return;

    try {
      // Stop and close local tracks
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
        setLocalVideoTrack(null);
      }
      
      if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
        setLocalAudioTrack(null);
      }

      // Leave channel
      await client.leave();
      setIsJoined(false);
      setRemoteUsers([]);

      // Log call end in Firebase
      await logCallEvent('call_ended', {
        channelName,
        participantId: user?.id,
        timestamp: Date.now()
      });

      toast({
        title: "Appel terminé",
        description: "Vous avez quitté l'appel",
      });

      onCallEnd?.();
    } catch (error) {
      console.error('Error leaving channel:', error);
    }
  };

  const toggleVideo = async () => {
    if (!localVideoTrack) return;

    if (isVideoEnabled) {
      await localVideoTrack.setEnabled(false);
      setIsVideoEnabled(false);
    } else {
      await localVideoTrack.setEnabled(true);
      setIsVideoEnabled(true);
    }
  };

  const toggleAudio = async () => {
    if (!localAudioTrack) return;

    if (isAudioEnabled) {
      await localAudioTrack.setEnabled(false);
      setIsAudioEnabled(false);
    } else {
      await localAudioTrack.setEnabled(true);
      setIsAudioEnabled(true);
    }
  };

  const logCallEvent = async (eventType: string, data: any) => {
    if (!user) return;

    try {
      await setDoc(doc(firestore, 'call_history', `${user.id}_${Date.now()}`), {
        userId: user.id,
        eventType,
        data,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging call event:', error);
    }
  };

  const cleanup = async () => {
    if (isJoined) {
      await leaveChannel();
    }
    if (client) {
      client.removeAllListeners();
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Appel Vidéo - {channelName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              {!isJoined ? (
                <Button 
                  onClick={joinChannel}
                  disabled={isConnecting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isConnecting ? 'Connexion...' : 'Rejoindre l\'appel'}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={toggleVideo}
                    variant={isVideoEnabled ? "default" : "destructive"}
                    size="icon"
                  >
                    {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    onClick={toggleAudio}
                    variant={isAudioEnabled ? "default" : "destructive"}
                    size="icon"
                  >
                    {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    onClick={leaveChannel}
                    variant="destructive"
                    size="icon"
                  >
                    <PhoneOff className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Local Video */}
              <div className="relative">
                <div 
                  ref={localVideoRef}
                  className="w-full h-64 bg-muted rounded-lg overflow-hidden"
                >
                  {!isVideoEnabled && (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <VideoOff className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  Vous {!isAudioEnabled && '(Muet)'}
                </div>
              </div>

              {/* Remote Videos */}
              {remoteUsers.map((user) => (
                <div key={user.uid} className="relative">
                  <div 
                    ref={(el) => { remoteVideoRefs.current[user.uid] = el; }}
                    className="w-full h-64 bg-muted rounded-lg overflow-hidden"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    Utilisateur {user.uid}
                  </div>
                </div>
              ))}
            </div>

            {/* Connection Status */}
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Status: {isJoined ? 'Connecté' : 'Déconnecté'} | 
                Participants: {remoteUsers.length + (isJoined ? 1 : 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CallScreen;