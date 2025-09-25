import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Star, 
  Phone, 
  AlertTriangle, 
  Navigation,
  User,
  Settings,
  TrendingUp,
  Car,
  Route,
  Battery,
  Fuel,
  Shield,
  MessageSquare,
  BarChart3,
  History,
  Bike,
  CreditCard,
  QrCode,
  FileText,
  Globe,
  Eye,
  Download,
  Search,
  Filter,
  Upload,
  Camera,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Send,
  Users,
  Wallet,
  PlusCircle,
  Calendar,
  
  AlertCircle,
  Zap,
  Activity
} from 'lucide-react';

interface Course {
  id: string;
  client: string;
  clientPhone: string;
  pickup: string;
  destination: string;
  distance: string;
  price: number;
  negotiatedPrice?: number;
  status: 'en_attente' | 'acceptee' | 'en_cours' | 'terminee' | 'negotiation';
  duration: string;
  rating?: number;
  pricingType: 'fixed' | 'zone' | 'per_km';
  priceStatus: 'pending' | 'accepted' | 'negotiating' | 'locked';
}

interface PricingRule {
  id: string;
  type: 'fixed' | 'zone' | 'per_km';
  fromZone?: string;
  toZone?: string;
  basePrice: number;
  pricePerKm?: number;
  description: string;
  isActive: boolean;
}

interface ClientMessage {
  id: string;
  courseId: string;
  senderId: string;
  senderType: 'client' | 'driver';
  message: string;
  timestamp: string;
  isRead: boolean;
  messageType: 'text' | 'audio' | 'system';
}

interface CommunicationSession {
  id: string;
  courseId: string;
  clientId: string;
  driverId: string;
  sessionType: 'chat' | 'audio' | 'video';
  startTime: string;
  endTime?: string;
  status: 'active' | 'ended';
  agoraChannelId?: string;
}

interface BadgeData {
  id: string;
  badgeNumber: string;
  driverName: string;
  phoneNumber: string;
  registrationNumber: string;
  syndicat: string;
  city: string;
  status: 'actif' | 'expire' | 'suspendu';
  qrCode: string;
  createdAt: string;
  expiresAt: string;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  driverId: string;
  amount: number;
  currency: string;
  validUntil: string;
  purchasedAt: string;
  qrCode: string;
  paymentMethod: string;
  status: 'valide' | 'expire' | 'utilise';
}

interface SOSAlert {
  id: string;
  driverId: string;
  driverName: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  status: 'active' | 'en_cours' | 'resolu';
  description?: string;
  responderId?: string;
}

interface InterSyndicatMessage {
  id: string;
  fromCity: string;
  toCity: string;
  fromSyndicat: string;
  toSyndicat: string;
  subject: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'normal' | 'urgent' | 'critique';
  attachments?: string[];
}

interface FinancialReport {
  ticketsSold: number;
  totalRevenue: number;
  cotisationsCollected: number;
  expenses: number;
  period: string;
}

const TaxiMotoInterface = () => {
  const { profile, logout } = useAuth();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Conakry, Guinée');
  const [todayEarnings, setTodayEarnings] = useState(127500);
  const [totalRides, setTotalRides] = useState(8);
  const [averageRating, setAverageRating] = useState(4.7);
  
  // Nouveaux états pour les fonctionnalités avancées
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [interMessages, setInterMessages] = useState<InterSyndicatMessage[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [clientMessages, setClientMessages] = useState<ClientMessage[]>([]);
  const [communicationSessions, setCommunicationSessions] = useState<CommunicationSession[]>([]);
  
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  
  // États pour le portefeuille
  const [walletBalance, setWalletBalance] = useState({
    GNF: 2500000,
    USD: 280,
    EUR: 250
  });
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [transferData, setTransferData] = useState({
    recipient: '',
    amount: '',
    currency: 'GNF',
    note: ''
  });
  const [withdrawData, setWithdrawData] = useState({
    amount: '',
    currency: 'GNF',
    method: 'mobile_money',
    phone: ''
  });
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeCall, setActiveCall] = useState<CommunicationSession | null>(null);
  
  const [newDriverData, setNewDriverData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    registrationNumber: '',
    city: '',
    syndicat: '',
    cniNumber: '',
    photoUrl: ''
  });
  
  const [newTicketData, setNewTicketData] = useState({
    amount: 5000,
    currency: 'GNF',
    validityPeriod: 'day',
    paymentMethod: 'mobile_money'
  });
  
  const [newMessageData, setNewMessageData] = useState({
    toCity: '',
    toSyndicat: '',
    subject: '',
    message: '',
    priority: 'normal' as const
  });

  const [newPricingRule, setNewPricingRule] = useState({
    type: 'fixed' as 'fixed' | 'zone' | 'per_km',
    fromZone: '',
    toZone: '',
    basePrice: 15000,
    pricePerKm: 2000,
    description: ''
  });

  const [negotiationData, setNegotiationData] = useState({
    originalPrice: 0,
    proposedPrice: 0,
    clientMessage: ''
  });
  
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      client: 'Mamadou Diallo',
      clientPhone: '+224622123456',
      pickup: 'Kaloum Centre',
      destination: 'Ratoma Marché',
      distance: '12.3 km',
      price: 25000,
      status: 'en_attente',
      duration: '25 min',
      pricingType: 'fixed',
      priceStatus: 'pending'
    },
    {
      id: '2',
      client: 'Fatoumata Camara',
      clientPhone: '+224655987654',
      pickup: 'Dixinn Port',
      destination: 'Université de Conakry',
      distance: '8.5 km',
      price: 18000,
      status: 'en_attente',
      duration: '18 min',
      pricingType: 'per_km',
      priceStatus: 'pending'
    }
  ]);


  const [samplePricingRules] = useState<PricingRule[]>([
    {
      id: '1',
      type: 'zone',
      fromZone: 'Centre-ville',
      toZone: 'Aéroport',
      basePrice: 50000,
      description: 'Tarif fixe Centre-ville vers Aéroport',
      isActive: true
    },
    {
      id: '2',
      type: 'per_km',
      basePrice: 5000,
      pricePerKm: 2500,
      description: 'Tarif au kilomètre standard',
      isActive: true
    }
  ]);

  const [sampleCommunication] = useState<ClientMessage[]>([
    {
      id: '1',
      courseId: '1',
      senderId: 'client-1',
      senderType: 'client',
      message: 'Bonjour, je suis en route vers le point de rendez-vous',
      timestamp: '2024-12-20T14:30:00Z',
      isRead: true,
      messageType: 'text'
    },
    {
      id: '2',
      courseId: '1',
      senderId: 'driver-1',
      senderType: 'driver',
      message: 'Parfait, je vous attends devant l\'entrée principale',
      timestamp: '2024-12-20T14:32:00Z',
      isRead: true,
      messageType: 'text'
    }
  ]);

  const [sampleTickets] = useState<Ticket[]>([
    {
      id: '1',
      ticketNumber: 'TKT-20241220-0001',
      driverId: 'DRV-001',
      amount: 5000,
      currency: 'GNF',
      validUntil: '2024-12-21',
      purchasedAt: '2024-12-20T08:30:00Z',
      qrCode: 'QR-TKT-0001',
      paymentMethod: 'mobile_money',
      status: 'valide'
    },
    {
      id: '2',
      ticketNumber: 'TKT-20241219-0045',
      driverId: 'DRV-001',
      amount: 30000,
      currency: 'GNF',
      validUntil: '2024-12-26',
      purchasedAt: '2024-12-19T10:15:00Z',
      qrCode: 'QR-TKT-0045',
      paymentMethod: 'card',
      status: 'valide'
    }
  ]);

  const [sampleSOSAlerts] = useState<SOSAlert[]>([
    {
      id: '1',
      driverId: 'DRV-001',
      driverName: 'Mamadou Diallo',
      latitude: 9.5370,
      longitude: -13.6785,
      timestamp: '2024-12-20T14:30:00Z',
      status: 'active',
      description: 'Accident mineur sur la route'
    },
    {
      id: '2',
      driverId: 'DRV-002',
      driverName: 'Ibrahim Bah',
      latitude: 9.5092,
      longitude: -13.7122,
      timestamp: '2024-12-20T12:15:00Z',
      status: 'resolu',
      description: 'Panne de moto résolue',
      responderId: 'RESP-001'
    }
  ]);

  const todayStats = {
    courses: totalRides,
    earnings: todayEarnings,
    hours: '6h 30min',
    rating: averageRating,
    fuel: 75,
    battery: 92,
    badgesActifs: 0, // Géré par le bureau syndical
    ticketsVendus: sampleTickets.length,
    alertesActives: sampleSOSAlerts.filter(a => a.status === 'active').length
  };

  const handleAcceptCourse = (courseId: string) => {
    setCourses(prev => 
      prev.map(course => 
        course.id === courseId 
          ? { ...course, status: 'acceptee' }
          : course
      )
    );
    toast({
      title: "Course acceptée",
      description: "Rendez-vous au point de collecte",
    });
  };

  const handleRejectCourse = (courseId: string) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
    toast({
      title: "Course refusée",
      description: "Recherche d'autres courses...",
    });
  };

  const handleStartCourse = (courseId: string) => {
    setCourses(prev => 
      prev.map(course => 
        course.id === courseId 
          ? { ...course, status: 'en_cours' }
          : course
      )
    );
  };

  const handleCompleteCourse = (courseId: string) => {
    setCourses(prev => 
      prev.map(course => 
        course.id === courseId 
          ? { ...course, status: 'terminee', rating: 5 }
          : course
      )
    );
    setTodayEarnings(prev => prev + 25000);
    setTotalRides(prev => prev + 1);
    toast({
      title: "Course terminée",
      description: "Paiement reçu avec succès!",
    });
  };

  const [sosRecording, setSosRecording] = useState({
    isRecording: false,
    audioRecorder: null as MediaRecorder | null,
    motionData: [] as any[],
    audioData: [] as any[],
    startTime: null as Date | null,
  });

  const handleSOSAlert = async () => {
    if (sosRecording.isRecording) {
      // Stop recording
      stopSOSRecording();
    } else {
      // Start emergency recording
      await startSOSRecording();
    }
  };

  const startSOSRecording = async () => {
    try {
      // Request permissions for microphone and motion
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100,
          channelCount: 2
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await uploadSOSEvidence(audioBlob, sosRecording.motionData);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start(1000); // Record in 1-second chunks
      
      // Start motion detection
      if ('DeviceMotionEvent' in window) {
        window.addEventListener('devicemotion', handleMotionData);
      }
      
      setSosRecording({
        isRecording: true,
        audioRecorder: mediaRecorder,
        motionData: [],
        audioData: audioChunks,
        startTime: new Date(),
      });
      
      toast({
        title: "🚨 SOS ACTIVÉ - ENREGISTREMENT EN COURS",
        description: "Audio, mouvements et environnement surveillés. Position GPS transmise!",
        variant: "destructive",
      });
      
      // Auto-stop recording after 5 minutes for safety
      setTimeout(() => {
        if (sosRecording.isRecording) {
          stopSOSRecording();
        }
      }, 300000); // 5 minutes
      
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'enregistrement SOS:', error);
      toast({
        title: "⚠️ Erreur SOS",
        description: "Impossible d'accéder au microphone. Alerte envoyée sans enregistrement.",
        variant: "destructive",
      });
    }
  };

  const stopSOSRecording = () => {
    if (sosRecording.audioRecorder && sosRecording.isRecording) {
      sosRecording.audioRecorder.stop();
      window.removeEventListener('devicemotion', handleMotionData);
      
      setSosRecording({
        isRecording: false,
        audioRecorder: null,
        motionData: [],
        audioData: [],
        startTime: null,
      });
      
      toast({
        title: "🛑 Enregistrement SOS arrêté",
        description: "Données sauvegardées et transmises au bureau syndical.",
      });
    }
  };

  const handleMotionData = (event: DeviceMotionEvent) => {
    const motionReading = {
      timestamp: new Date(),
      acceleration: {
        x: event.acceleration?.x || 0,
        y: event.acceleration?.y || 0,
        z: event.acceleration?.z || 0,
      },
      rotation: {
        alpha: event.rotationRate?.alpha || 0,
        beta: event.rotationRate?.beta || 0,
        gamma: event.rotationRate?.gamma || 0,
      },
      gravity: {
        x: event.accelerationIncludingGravity?.x || 0,
        y: event.accelerationIncludingGravity?.y || 0,
        z: event.accelerationIncludingGravity?.z || 0,
      }
    };
    
    setSosRecording(prev => ({
      ...prev,
      motionData: [...prev.motionData.slice(-100), motionReading] // Keep last 100 readings
    }));
  };

  const uploadSOSEvidence = async (audioBlob: Blob, motionData: any[]) => {
    try {
      // Convert audio to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const audioBase64 = reader.result as string;
        
        const evidenceData = {
          timestamp: new Date(),
          driverId: profile?.id,
          location: currentLocation,
          audioData: audioBase64,
          motionData: motionData,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
          }
        };
        
        // Save to local storage as backup
        localStorage.setItem(`sos_evidence_${Date.now()}`, JSON.stringify(evidenceData));
        
        // TODO: Send to backend API
        console.log('Evidence SOS sauvegardée:', evidenceData);
        
        toast({
          title: "✅ Preuves SOS sauvegardées",
          description: "Audio et données de mouvement transmises aux autorités.",
        });
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des preuves SOS:', error);
    }
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    toast({
      title: isOnline ? "Hors ligne" : "En ligne",
      description: isOnline ? "Vous ne recevrez plus de courses" : "Vous êtes maintenant disponible",
    });
  };

  const handleRegisterDriver = () => {
    toast({
      title: "Chauffeur enregistré",
      description: `Badge ${newDriverData.firstName} ${newDriverData.lastName} créé avec succès`,
    });
    setShowRegistrationModal(false);
  };

  const handleBuyTicket = () => {
    toast({
      title: "Ticket acheté",
      description: `Ticket valide jusqu'au ${new Date(Date.now() + 24*60*60*1000).toLocaleDateString()}`,
    });
    setShowTicketModal(false);
  };

  const handleSendMessage = () => {
    toast({
      title: "Message envoyé",
      description: `Message envoyé vers ${newMessageData.toCity}`,
    });
    setShowMessageModal(false);
  };

  // Nouvelles fonctions pour la fixation de prix
  const handleSetPrice = (courseId: string, price: number, pricingType: 'fixed' | 'zone' | 'per_km') => {
    setCourses(prev => 
      prev.map(course => 
        course.id === courseId 
          ? { ...course, price, pricingType, priceStatus: 'pending' }
          : course
      )
    );
    toast({
      title: "💰 Prix fixé",
      description: `Prix de ${price.toLocaleString()} GNF envoyé au client`,
    });
  };

  const handleNegotiation = (courseId: string, clientOffer: number) => {
    setCourses(prev => 
      prev.map(course => 
        course.id === courseId 
          ? { ...course, negotiatedPrice: clientOffer, priceStatus: 'negotiating' }
          : course
      )
    );
    setShowNegotiationModal(true);
  };

  const handleAcceptNegotiation = (courseId: string) => {
    setCourses(prev => 
      prev.map(course => 
        course.id === courseId 
          ? { ...course, price: course.negotiatedPrice || course.price, priceStatus: 'locked' }
          : course
      )
    );
    toast({
      title: "🤝 Négociation acceptée",
      description: "Prix verrouillé dans le système",
    });
    setShowNegotiationModal(false);
  };

  // Nouvelles fonctions pour la communication
  const handleStartChat = (course: Course) => {
    setSelectedCourse(course);
    setShowCommunicationModal(true);
  };

  const handleSendChatMessage = (message: string) => {
    if (!selectedCourse) return;
    
    const newMessage: ClientMessage = {
      id: Date.now().toString(),
      courseId: selectedCourse.id,
      senderId: 'driver-current',
      senderType: 'driver',
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
      messageType: 'text'
    };
    
    setClientMessages(prev => [...prev, newMessage]);
    toast({
      title: "Message envoyé",
      description: "Le client recevra une notification",
    });
  };

  const handleStartCall = (course: Course, callType: 'audio' | 'video') => {
    const newSession: CommunicationSession = {
      id: Date.now().toString(),
      courseId: course.id,
      clientId: course.client,
      driverId: 'current-driver',
      sessionType: callType,
      startTime: new Date().toISOString(),
      status: 'active',
      agoraChannelId: `channel-${course.id}-${Date.now()}`
    };
    
    setCommunicationSessions(prev => [...prev, newSession]);
    setActiveCall(newSession);
    
    toast({
      title: `📞 Appel ${callType === 'audio' ? 'audio' : 'vidéo'} démarré`,
      description: `Connexion avec ${course.client}`,
    });
  };

  const handleEndCall = () => {
    if (activeCall) {
      setCommunicationSessions(prev => 
        prev.map(session => 
          session.id === activeCall.id 
            ? { ...session, status: 'ended', endTime: new Date().toISOString() }
            : session
        )
      );
      setActiveCall(null);
      toast({
        title: "Appel terminé",
        description: "Communication fermée",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header avec statut */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bike className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Interface Taxi-Moto 224SOLUTIONS</h1>
                  <p className="text-muted-foreground">Badge #TM-001 - {profile?.full_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{currentLocation}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Switch checked={isOnline} onCheckedChange={toggleOnlineStatus} />
                    <Badge variant={isOnline ? "default" : "secondary"}>
                      {isOnline ? '🟢 En ligne' : '🔴 Hors ligne'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button 
                    variant="destructive" 
                    size="lg"
                    onClick={handleSOSAlert}
                    className={sosRecording.isRecording ? "animate-bounce bg-red-600" : "animate-pulse"}
                  >
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    {sosRecording.isRecording ? "🔴 ARRÊTER SOS" : "🆘 SOS"}
                    {sosRecording.isRecording && (
                      <div className="ml-2 flex items-center">
                        <div className="w-2 h-2 bg-red-300 rounded-full animate-ping"></div>
                        <span className="ml-1 text-xs">REC</span>
                      </div>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={async () => {
                      await logout();
                      window.location.href = '/';
                    }}
                    className="flex items-center gap-2"
                  >
                    <User className="h-5 w-5" />
                    Déconnexion
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="pricing">💰 Prix</TabsTrigger>
            <TabsTrigger value="communication">💬 Communication</TabsTrigger>
            <TabsTrigger value="wallet">💳 Portefeuille</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="sos">SOS</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Actions Rapides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Dialog open={showRegistrationModal} onOpenChange={setShowRegistrationModal}>
                    <DialogTrigger asChild>
                      <Button className="h-20 flex-col gap-2">
                        <User className="h-6 w-6" />
                        <span>Enregistrer Chauffeur</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>🚗 Enregistrement Nouveau Chauffeur</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Prénom</label>
                            <Input 
                              value={newDriverData.firstName}
                              onChange={(e) => setNewDriverData(prev => ({...prev, firstName: e.target.value}))}
                              placeholder="Prénom du chauffeur"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Nom</label>
                            <Input 
                              value={newDriverData.lastName}
                              onChange={(e) => setNewDriverData(prev => ({...prev, lastName: e.target.value}))}
                              placeholder="Nom du chauffeur"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Téléphone</label>
                            <Input 
                              value={newDriverData.phone}
                              onChange={(e) => setNewDriverData(prev => ({...prev, phone: e.target.value}))}
                              placeholder="+224 XXX XXX XXX"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">N° Immatriculation</label>
                            <Input 
                              value={newDriverData.registrationNumber}
                              onChange={(e) => setNewDriverData(prev => ({...prev, registrationNumber: e.target.value}))}
                              placeholder="CKY-XXXX-XX"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Ville</label>
                            <Select value={newDriverData.city} onValueChange={(value) => setNewDriverData(prev => ({...prev, city: value}))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner ville" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="conakry">Conakry</SelectItem>
                                <SelectItem value="kankan">Kankan</SelectItem>
                                <SelectItem value="labe">Labé</SelectItem>
                                <SelectItem value="nzerekore">N'Zérékoré</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Syndicat</label>
                            <Input 
                              value={newDriverData.syndicat}
                              onChange={(e) => setNewDriverData(prev => ({...prev, syndicat: e.target.value}))}
                              placeholder="Nom du syndicat"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">N° CNI</label>
                          <Input 
                            value={newDriverData.cniNumber}
                            onChange={(e) => setNewDriverData(prev => ({...prev, cniNumber: e.target.value}))}
                            placeholder="Numéro de CNI"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1">
                            <Camera className="h-4 w-4 mr-2" />
                            Prendre Photo
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Upload className="h-4 w-4 mr-2" />
                            Uploader Photo
                          </Button>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button variant="outline" className="flex-1" onClick={() => setShowRegistrationModal(false)}>
                            Annuler
                          </Button>
                          <Button className="flex-1" onClick={handleRegisterDriver}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Enregistrer
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showTicketModal} onOpenChange={setShowTicketModal}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-20 flex-col gap-2">
                        <FileText className="h-6 w-6" />
                        <span>Acheter Ticket</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>🎫 Achat Ticket Routier</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <div>
                          <label className="text-sm font-medium">Montant</label>
                          <Input 
                            type="number"
                            value={newTicketData.amount}
                            onChange={(e) => setNewTicketData(prev => ({...prev, amount: parseInt(e.target.value)}))}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Validité</label>
                          <Select value={newTicketData.validityPeriod} onValueChange={(value) => setNewTicketData(prev => ({...prev, validityPeriod: value}))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="day">1 Jour (5,000 GNF)</SelectItem>
                              <SelectItem value="week">1 Semaine (30,000 GNF)</SelectItem>
                              <SelectItem value="month">1 Mois (100,000 GNF)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Mode de Paiement</label>
                          <Select value={newTicketData.paymentMethod} onValueChange={(value) => setNewTicketData(prev => ({...prev, paymentMethod: value}))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mobile_money">📱 Mobile Money</SelectItem>
                              <SelectItem value="card">💳 Carte Bancaire</SelectItem>
                              <SelectItem value="stripe">💰 Stripe</SelectItem>
                              <SelectItem value="paypal">🅿️ PayPal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button variant="outline" className="flex-1" onClick={() => setShowTicketModal(false)}>
                            Annuler
                          </Button>
                          <Button className="flex-1" onClick={handleBuyTicket}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Payer {newTicketData.amount.toLocaleString()} GNF
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-20 flex-col gap-2">
                        <MessageSquare className="h-6 w-6" />
                        <span>Message Inter-Ville</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>📡 Communication Inter-Syndicats</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Ville Destinataire</label>
                            <Select value={newMessageData.toCity} onValueChange={(value) => setNewMessageData(prev => ({...prev, toCity: value}))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner ville" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kankan">🏙️ Kankan</SelectItem>
                                <SelectItem value="labe">🌄 Labé</SelectItem>
                                <SelectItem value="nzerekore">🌳 N'Zérékoré</SelectItem>
                                <SelectItem value="kindia">🏞️ Kindia</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Priorité</label>
                            <Select value={newMessageData.priority} onValueChange={(value) => setNewMessageData(prev => ({...prev, priority: value as any}))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">🟢 Normal</SelectItem>
                                <SelectItem value="urgent">🟡 Urgent</SelectItem>
                                <SelectItem value="critique">🔴 Critique</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Sujet</label>
                          <Input 
                            value={newMessageData.subject}
                            onChange={(e) => setNewMessageData(prev => ({...prev, subject: e.target.value}))}
                            placeholder="Objet du message"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Message</label>
                          <Textarea 
                            value={newMessageData.message}
                            onChange={(e) => setNewMessageData(prev => ({...prev, message: e.target.value}))}
                            placeholder="Tapez votre message..."
                            rows={4}
                          />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button variant="outline" className="flex-1" onClick={() => setShowMessageModal(false)}>
                            Annuler
                          </Button>
                          <Button className="flex-1" onClick={handleSendMessage}>
                            <Send className="h-4 w-4 mr-2" />
                            Envoyer Message
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    variant="outline" 
                    className={`h-20 flex-col gap-2 ${sosRecording.isRecording ? 'border-red-500 bg-red-50' : ''}`} 
                    onClick={handleSOSAlert}
                  >
                    <AlertTriangle className={`h-6 w-6 ${sosRecording.isRecording ? 'text-red-600 animate-bounce' : 'text-red-500'}`} />
                    <span>{sosRecording.isRecording ? "🔴 Arrêter SOS" : "Alerte SOS"}</span>
                    {sosRecording.isRecording && (
                      <div className="text-xs text-red-600 flex items-center gap-1">
                        <div className="w-1 h-1 bg-red-600 rounded-full animate-ping"></div>
                        Enregistrement...
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques du dashboard */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Route className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Courses aujourd'hui</p>
                      <p className="text-2xl font-bold">{todayStats.courses}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Gains du jour</p>
                      <p className="text-2xl font-bold">{todayStats.earnings.toLocaleString()} GNF</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Badges Actifs</p>
                      <p className="text-2xl font-bold">{todayStats.badgesActifs}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Note moyenne</p>
                      <p className="text-2xl font-bold">{todayStats.rating}/5</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* État de la moto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bike className="h-5 w-5" />
                  État de la Moto & Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-blue-600" />
                      <span>Carburant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div 
                          className="h-full bg-blue-600 rounded-full" 
                          style={{ width: `${todayStats.fuel}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{todayStats.fuel}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Battery className="h-4 w-4 text-green-600" />
                      <span>Batterie</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div 
                          className="h-full bg-green-600 rounded-full" 
                          style={{ width: `${todayStats.battery}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{todayStats.battery}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span>Alertes SOS</span>
                    </div>
                    <Badge variant={todayStats.alertesActives > 0 ? "destructive" : "default"}>
                      {todayStats.alertesActives} active(s)
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fixation de Prix */}
          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Gestion des Prix de Service
                </CardTitle>
                <CardDescription>
                  Fixez vos tarifs par course, zone ou kilomètre
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#FF6A00] hover:bg-[#e55f00] text-white font-bold rounded-xl shadow-md px-6 py-3 flex items-center space-x-2">
                        <DollarSign className="h-5 w-5" />
                        <span>Fixer le prix</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>💰 Configurer Nouveau Tarif</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <div>
                          <label className="text-sm font-medium">Type de Tarification</label>
                          <Select value={newPricingRule.type} onValueChange={(value) => setNewPricingRule(prev => ({...prev, type: value as any}))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">💵 Prix Fixe par Course</SelectItem>
                              <SelectItem value="zone">🗺️ Prix par Zone</SelectItem>
                              <SelectItem value="per_km">📏 Prix au Kilomètre</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {newPricingRule.type === 'zone' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Zone de Départ</label>
                              <Input 
                                value={newPricingRule.fromZone}
                                onChange={(e) => setNewPricingRule(prev => ({...prev, fromZone: e.target.value}))}
                                placeholder="Ex: Centre-ville"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Zone d'Arrivée</label>
                              <Input 
                                value={newPricingRule.toZone}
                                onChange={(e) => setNewPricingRule(prev => ({...prev, toZone: e.target.value}))}
                                placeholder="Ex: Aéroport"
                              />
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Prix de Base (GNF)</label>
                            <Input 
                              type="number"
                              value={newPricingRule.basePrice}
                              onChange={(e) => setNewPricingRule(prev => ({...prev, basePrice: parseInt(e.target.value)}))}
                            />
                          </div>
                          {newPricingRule.type === 'per_km' && (
                            <div>
                              <label className="text-sm font-medium">Prix par KM (GNF)</label>
                              <Input 
                                type="number"
                                value={newPricingRule.pricePerKm}
                                onChange={(e) => setNewPricingRule(prev => ({...prev, pricePerKm: parseInt(e.target.value)}))}
                              />
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Input 
                            value={newPricingRule.description}
                            onChange={(e) => setNewPricingRule(prev => ({...prev, description: e.target.value}))}
                            placeholder="Description de cette règle tarifaire"
                          />
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button variant="outline" className="flex-1" onClick={() => setShowPricingModal(false)}>
                            Annuler
                          </Button>
                          <Button className="flex-1">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Créer Règle
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    Analyse IA des Prix
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Règles Tarifaires Actives</h3>
                  {samplePricingRules.map(rule => (
                    <Card key={rule.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium">{rule.description}</span>
                              <Badge variant="default">
                                {rule.type === 'fixed' ? '💵 Fixe' : rule.type === 'zone' ? '🗺️ Zone' : '📏 Au KM'}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {rule.type === 'zone' && (
                                <div>Route: {rule.fromZone} → {rule.toZone}</div>
                              )}
                              <div>Prix de base: {rule.basePrice.toLocaleString()} GNF</div>
                              {rule.pricePerKm && (
                                <div>Prix/km: {rule.pricePerKm.toLocaleString()} GNF</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-1" />
                              Modifier
                            </Button>
                            <Button variant="outline" size="sm">
                              <XCircle className="h-4 w-4 mr-1" />
                              Désactiver
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Négociation en cours */}
                <Dialog open={showNegotiationModal} onOpenChange={setShowNegotiationModal}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>🤝 Négociation Client</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm"><strong>Prix proposé :</strong> {negotiationData.originalPrice.toLocaleString()} GNF</p>
                        <p className="text-sm"><strong>Contre-proposition client :</strong> {negotiationData.proposedPrice.toLocaleString()} GNF</p>
                        <p className="text-sm"><strong>Message client :</strong> "{negotiationData.clientMessage}"</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          <XCircle className="h-4 w-4 mr-2" />
                          Refuser
                        </Button>
                        <Button className="flex-1" onClick={() => handleAcceptNegotiation(selectedCourse?.id || '')}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accepter
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Chauffeur-Client */}
          <TabsContent value="communication" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Communication avec les Clients
                </CardTitle>
                <CardDescription>
                  Chat sécurisé et appels audio/vidéo avec Agora API
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Appel actif */}
                {activeCall && (
                  <Card className="border-green-500 border-2 mb-6">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                            <Phone className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">Appel {activeCall.sessionType} en cours</p>
                            <p className="text-sm text-muted-foreground">Avec {activeCall.clientId}</p>
                          </div>
                        </div>
                        <Button variant="destructive" onClick={handleEndCall}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Raccrocher
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Liste des courses avec communication disponible */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Courses avec Communication Active</h3>
                  {courses.filter(c => c.status === 'acceptee' || c.status === 'en_cours').map(course => (
                    <Card key={course.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="font-medium">{course.client}</span>
                              <Badge variant="outline">{course.status}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <div>{course.pickup} → {course.destination}</div>
                              <div>📞 {course.clientPhone}</div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleStartChat(course)}>
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Chat
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleStartCall(course, 'audio')}>
                              <Phone className="h-4 w-4 mr-1" />
                              Audio
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleStartCall(course, 'video')}>
                              <Camera className="h-4 w-4 mr-1" />
                              Vidéo
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Modal de Chat */}
                <Dialog open={showCommunicationModal} onOpenChange={setShowCommunicationModal}>
                  <DialogContent className="max-w-2xl h-[70vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle>💬 Chat avec {selectedCourse?.client}</DialogTitle>
                    </DialogHeader>
                    
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 rounded">
                      {sampleCommunication
                        .filter(msg => msg.courseId === selectedCourse?.id)
                        .map(msg => (
                          <div key={msg.id} className={`flex ${msg.senderType === 'driver' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs p-3 rounded-lg ${msg.senderType === 'driver' ? 'bg-blue-500 text-white' : 'bg-white border'}`}>
                              <p className="text-sm">{msg.message}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                    
                    {/* Input message */}
                    <div className="flex gap-2 mt-4">
                      <Input 
                        placeholder="Tapez votre message..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSendChatMessage(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion des Tickets */}
          <TabsContent value="tickets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Tickets Routiers (Taxe Journalière)
                </CardTitle>
                <CardDescription>
                  Achat et vérification des tickets de circulation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Button onClick={() => setShowTicketModal(true)}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Acheter Ticket
                  </Button>
                  <Button variant="outline">
                    <QrCode className="h-4 w-4 mr-2" />
                    Scanner Ticket
                  </Button>
                  <Button variant="outline">
                    <History className="h-4 w-4 mr-2" />
                    Historique
                  </Button>
                </div>

                <div className="space-y-4">
                  {sampleTickets.map(ticket => (
                    <Card key={ticket.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="font-medium">Ticket #{ticket.ticketNumber}</span>
                              <Badge variant={ticket.status === 'valide' ? 'default' : 'destructive'}>
                                {ticket.status === 'valide' ? '✅ Valide' : '❌ Expiré'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                              <div>Montant: {ticket.amount.toLocaleString()} {ticket.currency}</div>
                              <div>Acheté: {new Date(ticket.purchasedAt).toLocaleDateString()}</div>
                              <div>Valide jusqu'au: {new Date(ticket.validUntil).toLocaleDateString()}</div>
                              <div>Paiement: {ticket.paymentMethod}</div>
                              <div>QR Code: {ticket.qrCode}</div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <QrCode className="h-4 w-4 mr-1" />
                              Afficher QR
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Télécharger
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portefeuille */}
          <TabsContent value="wallet" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Mon Portefeuille
                </CardTitle>
                <CardDescription>
                  Gérez vos revenus, transferts et retraits
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Soldes */}
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                  <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600">Solde GNF</p>
                        <p className="text-2xl font-bold text-green-800">{walletBalance.GNF.toLocaleString()} GNF</p>
                      </div>
                      <div className="p-2 bg-green-100 rounded-full">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Solde USD</p>
                        <p className="text-2xl font-bold text-blue-800">${walletBalance.USD.toLocaleString()}</p>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-full">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600">Solde EUR</p>
                        <p className="text-2xl font-bold text-purple-800">€{walletBalance.EUR.toLocaleString()}</p>
                      </div>
                      <div className="p-2 bg-purple-100 rounded-full">
                        <DollarSign className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Actions */}
                <div className="grid gap-4 md:grid-cols-2 mb-6">
                  <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
                    <DialogTrigger asChild>
                      <Button className="h-20 flex-col gap-2 bg-blue-600 hover:bg-blue-700">
                        <Send className="h-6 w-6" />
                        <span>Transférer</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>💸 Transférer de l'argent</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <div>
                          <label className="text-sm font-medium">Destinataire (Numéro ou ID)</label>
                          <Input 
                            value={transferData.recipient}
                            onChange={(e) => setTransferData(prev => ({...prev, recipient: e.target.value}))}
                            placeholder="Ex: +224 621 123 456 ou CLT-0001"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Montant</label>
                            <Input 
                              type="number"
                              value={transferData.amount}
                              onChange={(e) => setTransferData(prev => ({...prev, amount: e.target.value}))}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Devise</label>
                            <Select value={transferData.currency} onValueChange={(value) => setTransferData(prev => ({...prev, currency: value}))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="GNF">GNF (Franc Guinéen)</SelectItem>
                                <SelectItem value="USD">USD (Dollar)</SelectItem>
                                <SelectItem value="EUR">EUR (Euro)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Note (optionnel)</label>
                          <Textarea 
                            value={transferData.note}
                            onChange={(e) => setTransferData(prev => ({...prev, note: e.target.value}))}
                            placeholder="Motif du transfert..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => setShowTransferModal(false)}>
                            Annuler
                          </Button>
                          <Button className="flex-1" onClick={() => {
                            toast({
                              title: "💸 Transfert initié",
                              description: `Transfert de ${transferData.amount} ${transferData.currency} en cours...`,
                            });
                            setShowTransferModal(false);
                          }}>
                            Transférer
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-20 flex-col gap-2">
                        <CreditCard className="h-6 w-6" />
                        <span>Retirer</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>💳 Retrait d'argent</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Montant</label>
                            <Input 
                              type="number"
                              value={withdrawData.amount}
                              onChange={(e) => setWithdrawData(prev => ({...prev, amount: e.target.value}))}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Devise</label>
                            <Select value={withdrawData.currency} onValueChange={(value) => setWithdrawData(prev => ({...prev, currency: value}))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="GNF">GNF (Franc Guinéen)</SelectItem>
                                <SelectItem value="USD">USD (Dollar)</SelectItem>
                                <SelectItem value="EUR">EUR (Euro)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Méthode de retrait</label>
                          <Select value={withdrawData.method} onValueChange={(value) => setWithdrawData(prev => ({...prev, method: value}))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mobile_money">📱 Mobile Money</SelectItem>
                              <SelectItem value="bank_transfer">🏦 Virement bancaire</SelectItem>
                              <SelectItem value="cash_pickup">💰 Retrait en espèces</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {withdrawData.method === 'mobile_money' && (
                          <div>
                            <label className="text-sm font-medium">Numéro de téléphone</label>
                            <Input 
                              value={withdrawData.phone}
                              onChange={(e) => setWithdrawData(prev => ({...prev, phone: e.target.value}))}
                              placeholder="+224 621 123 456"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => setShowWithdrawModal(false)}>
                            Annuler
                          </Button>
                          <Button className="flex-1" onClick={() => {
                            toast({
                              title: "💳 Retrait demandé",
                              description: `Demande de retrait de ${withdrawData.amount} ${withdrawData.currency} soumise.`,
                            });
                            setShowWithdrawModal(false);
                          }}>
                            Retirer
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Historique des transactions récentes */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Transactions récentes</h3>
                  <div className="space-y-3">
                    {[
                      { id: 1, type: 'earning', amount: 25000, currency: 'GNF', description: 'Course vers Kaloum', date: '2024-12-20 14:30' },
                      { id: 2, type: 'earning', amount: 18000, currency: 'GNF', description: 'Course vers Ratoma', date: '2024-12-20 13:15' },
                      { id: 3, type: 'withdrawal', amount: 500000, currency: 'GNF', description: 'Retrait Mobile Money', date: '2024-12-20 10:00' },
                      { id: 4, type: 'transfer', amount: 50000, currency: 'GNF', description: 'Transfert vers famille', date: '2024-12-19 18:45' }
                    ].map(transaction => (
                      <Card key={transaction.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              transaction.type === 'earning' ? 'bg-green-100 text-green-600' :
                              transaction.type === 'withdrawal' ? 'bg-blue-100 text-blue-600' :
                              'bg-orange-100 text-orange-600'
                            }`}>
                              {transaction.type === 'earning' ? '💰' : 
                               transaction.type === 'withdrawal' ? '💳' : '📤'}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">{transaction.date}</p>
                            </div>
                          </div>
                          <div className={`font-bold ${
                            transaction.type === 'earning' ? 'text-green-600' :
                            transaction.type === 'withdrawal' ? 'text-blue-600' :
                            'text-orange-600'
                          }`}>
                            {transaction.type === 'earning' ? '+' : '-'}
                            {transaction.amount.toLocaleString()} {transaction.currency}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Système SOS */}
          <TabsContent value="sos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Système d'Alerte SOS
                </CardTitle>
                <CardDescription>
                  Géolocalisation d'urgence et suivi des alertes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                      <p className="text-sm text-muted-foreground">Alertes Actives</p>
                      <p className="text-2xl font-bold">{sampleSOSAlerts.filter(a => a.status === 'active').length}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <p className="text-sm text-muted-foreground">En Cours</p>
                      <p className="text-2xl font-bold">{sampleSOSAlerts.filter(a => a.status === 'en_cours').length}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-sm text-muted-foreground">Résolues</p>
                      <p className="text-2xl font-bold">{sampleSOSAlerts.filter(a => a.status === 'resolu').length}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  {sampleSOSAlerts.map(alert => (
                    <Card key={alert.id} className={`border-l-4 ${alert.status === 'active' ? 'border-l-red-500' : alert.status === 'en_cours' ? 'border-l-orange-500' : 'border-l-green-500'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="font-medium">{alert.driverName}</span>
                              <Badge variant={alert.status === 'active' ? 'destructive' : alert.status === 'en_cours' ? 'default' : 'secondary'}>
                                {alert.status === 'active' ? '🔴 Active' : alert.status === 'en_cours' ? '🟡 En cours' : '🟢 Résolue'}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <div>Position: {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}</div>
                              <div>Heure: {new Date(alert.timestamp).toLocaleString()}</div>
                              {alert.description && <div>Description: {alert.description}</div>}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <MapPin className="h-4 w-4 mr-1" />
                              Localiser
                            </Button>
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4 mr-1" />
                              Appeler
                            </Button>
                            {alert.status === 'active' && (
                              <Button size="sm">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Prendre en Charge
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Inter-Syndicats */}
          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Communication Inter-Syndicats
                </CardTitle>
                <CardDescription>
                  Messages entre bureaux syndicaux des différentes villes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Button onClick={() => setShowMessageModal(true)}>
                    <Send className="h-4 w-4 mr-2" />
                    Nouveau Message
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                  </Button>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrer
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2" />
                    <p>Aucun message inter-syndicat</p>
                    <p className="text-sm">Cliquez sur "Nouveau Message" pour commencer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses existantes */}
          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Courses Disponibles</CardTitle>
                <CardDescription>
                  Acceptez les courses et fixez vos prix
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.map(course => (
                  <Card key={course.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{course.client}</span>
                            <Badge variant="outline">{course.status}</Badge>
                            {course.priceStatus === 'locked' && <Badge variant="default">💰 Prix Verrouillé</Badge>}
                            {course.priceStatus === 'negotiating' && <Badge variant="secondary">🤝 En Négociation</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-1 mb-1">
                              <MapPin className="h-3 w-3 text-green-600" />
                              <span>Départ: {course.pickup}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-red-600" />
                              <span>Arrivée: {course.destination}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Phone className="h-3 w-3 text-blue-600" />
                              <span>{course.clientPhone}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Route className="h-3 w-3" />
                              {course.distance}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {course.duration}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-green-600">
                              <DollarSign className="h-3 w-3" />
                              {course.negotiatedPrice || course.price.toLocaleString()} GNF
                              {course.pricingType === 'per_km' && ' (au km)'}
                              {course.pricingType === 'zone' && ' (zone fixe)'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 flex-col">
                          {course.status === 'en_attente' && course.priceStatus === 'pending' && (
                            <>
                              <Button 
                                className="bg-[#FF6A00] hover:bg-[#e55f00] text-white font-bold rounded-xl shadow-md px-4 py-2 flex items-center space-x-2"
                                size="sm"
                                onClick={() => handleSetPrice(course.id, course.price, 'fixed')}
                              >
                                <DollarSign className="h-4 w-4" />
                                <span>Fixer le prix</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRejectCourse(course.id)}
                              >
                                Refuser
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleAcceptCourse(course.id)}
                              >
                                Accepter
                              </Button>
                            </>
                          )}
                          
                          {course.priceStatus === 'negotiating' && (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Contre-offre: {course.negotiatedPrice?.toLocaleString()} GNF
                              </Button>
                            </div>
                          )}

                          {course.status === 'acceptee' && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm"
                                onClick={() => handleStartCourse(course.id)}
                              >
                                Démarrer
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleStartChat(course)}>
                                💬 Chat
                              </Button>
                            </div>
                          )}
                          
                          {course.status === 'en_cours' && (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleStartChat(course)}>
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Chat
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleStartCall(course, 'audio')}>
                                <Phone className="h-4 w-4 mr-1" />
                                Appeler
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleCompleteCourse(course.id)}
                              >
                                Terminer
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dashboard Administrateur avec nouvelles stats */}
          <TabsContent value="admin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Dashboard Administrateur Taxi-Moto
                </CardTitle>
                <CardDescription>
                  Vue globale avec nouvelles statistiques de prix et communication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm text-muted-foreground">Chauffeurs Enregistrés</p>
                      <p className="text-2xl font-bold">1,247</p>
                      <p className="text-xs text-green-600">+23 cette semaine</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-sm text-muted-foreground">Prix Moyen/Course</p>
                      <p className="text-2xl font-bold">22,450 GNF</p>
                      <p className="text-xs text-green-600">+5% ce mois</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-sm text-muted-foreground">Messages/Jour</p>
                      <p className="text-2xl font-bold">2,847</p>
                      <p className="text-xs text-green-600">+18% ce mois</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Phone className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <p className="text-sm text-muted-foreground">Appels/Jour</p>
                      <p className="text-2xl font-bold">542</p>
                      <p className="text-xs text-red-600">3 plaintes</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                      <p className="text-sm text-muted-foreground">Tarifs Abusifs</p>
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-xs text-red-600">détectés par IA</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Actions Administratives</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start">
                          <QrCode className="h-4 w-4 mr-2" />
                          Scanner Badge/Ticket
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Lock className="h-4 w-4 mr-2" />
                          Suspendre Chauffeur (Tarifs Abusifs)
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analyse Prix par Zone
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Modération Communication
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Activity className="h-4 w-4 mr-2" />
                          Rapport OpenAI Anomalies
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Monitoring IA & Communication</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Système IA opérationnel</span>
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">3,247 prix analysés aujourd'hui</span>
                          </div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-purple-600" />
                            <span className="text-sm">1,856 conversations monitorées</span>
                          </div>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm">12 anomalies tarifaires détectées</span>
                          </div>
                        </div>
                        <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-500">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-orange-600" />
                            <span className="text-sm">542 appels Agora actifs</span>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Rapport Complet Intelligent
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Nouvelles sections pour prix et communication */}
                <div className="grid gap-4 md:grid-cols-2 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Statistiques Tarifaires</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                          <span className="text-sm">Prix moyen Centre-ville</span>
                          <span className="font-bold">18,500 GNF</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                          <span className="text-sm">Prix moyen Aéroport</span>
                          <span className="font-bold">45,000 GNF</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                          <span className="text-sm">Négociations réussies</span>
                          <span className="font-bold">78%</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                          <span className="text-sm">Prix détectés abusifs</span>
                          <span className="font-bold text-red-600">12 (0.3%)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Communication Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                          <span className="text-sm">Messages échangés</span>
                          <span className="font-bold">28,470</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                          <span className="text-sm">Appels audio réussis</span>
                          <span className="font-bold">1,856 (95%)</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                          <span className="text-sm">Appels vidéo</span>
                          <span className="font-bold">342</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                          <span className="text-sm">Plaintes communication</span>
                          <span className="font-bold text-red-600">3 (0.1%)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TaxiMotoInterface;