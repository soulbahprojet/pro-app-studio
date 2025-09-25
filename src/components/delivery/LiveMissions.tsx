import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { 
  MapPin, 
  Navigation, 
  Clock, 
  DollarSign, 
  Star, 
  Phone, 
  MessageSquare,
  Car,
  Bike,
  Package,
  User,
  Zap,
  Filter,
  Search,
  BarChart3,
  Wifi,
  Battery,
  Signal,
  X,
  Send,
  ArrowLeft,
  MoreVertical,
  Video,
  Mic,
  MicOff,
  Paperclip,
  Camera,
  File,
  Image,
  Play,
  Pause,
  Download
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { useToast } from "../ui/use-toast";

interface LiveMissionsProps {
  driverStatus: "online" | "offline" | "busy";
  onStatusChange: (status: "online" | "offline" | "busy") => void;
  onMissionAccept: (mission: any) => void;
  fullView?: boolean;
}

const LiveMissions: React.FC<LiveMissionsProps> = ({ 
  driverStatus, 
  onStatusChange, 
  onMissionAccept,
  fullView = false 
}) => {
  const [missions, setMissions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [todayStats, setTodayStats] = useState({
    rides: 8,
    earnings: "245,000",
    rating: 4.9,
    hours: 6.5,
    acceptanceRate: 92
  });
  const [chatOpen, setChatOpen] = useState(false);
  const [callInterface, setCallInterface] = useState(false);
  const [activeClient, setActiveClient] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video' | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callTimer, setCallTimer] = useState<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

  // Simulation de missions en temps réel
  useEffect(() => {
    const mockMissions = [
      {
        id: 1,
        type: 'ride',
        client: "Mamadou Diallo",
        clientRating: 4.8,
        pickup: "Sandervalia, Conakry",
        destination: "Kaloum Center",
        pickupCoords: { lat: 9.5092, lng: -13.7122 },
        destinationCoords: { lat: 9.5380, lng: -13.6773 },
        distance: "5.2 km",
        duration: "15 min",
        price: "25,000 GNF",
        surge: false,
        vehicleType: "moto",
        estimatedTime: "3 min",
        requestTime: new Date().toLocaleTimeString(),
        paymentMethod: "mobile_money"
      },
      {
        id: 2,
        type: 'delivery',
        client: "Fatoumata Camara",
        clientRating: 4.9,
        pickup: "Restaurant Délice, Ratoma",
        destination: "Université de Conakry",
        pickupCoords: { lat: 9.5745, lng: -13.6486 },
        destinationCoords: { lat: 9.5380, lng: -13.6773 },
        distance: "8.1 km",
        duration: "25 min",
        price: "35,000 GNF",
        surge: true,
        surgeMultiplier: 1.5,
        vehicleType: "voiture",
        estimatedTime: "5 min",
        requestTime: new Date().toLocaleTimeString(),
        paymentMethod: "card",
        packageType: "nourriture"
      },
      {
        id: 3,
        type: 'ride',
        client: "Alpha Barry",
        clientRating: 4.6,
        pickup: "Aéroport de Conakry",
        destination: "Hôtel Novotel Conakry",
        pickupCoords: { lat: 9.5745, lng: -13.6486 },
        destinationCoords: { lat: 9.5380, lng: -13.6773 },
        distance: "12.3 km",
        duration: "35 min",
        price: "65,000 GNF",
        surge: false,
        vehicleType: "voiture",
        estimatedTime: "8 min",
        requestTime: new Date().toLocaleTimeString(),
        paymentMethod: "cash"
      }
    ];

    if (driverStatus === 'online') {
      setMissions(mockMissions);
    } else {
      setMissions([]);
    }
  }, [driverStatus]);

  const handleAcceptMission = (mission: any) => {
    toast({
      title: "Mission acceptée!",
      description: `Direction: ${mission.pickup}`,
    });
    onMissionAccept(mission);
    setMissions(prev => prev.filter(m => m.id !== mission.id));
    onStatusChange('busy');
  };

  const handleRejectMission = (missionId: number) => {
    setMissions(prev => prev.filter(m => m.id !== missionId));
    toast({
      title: "Mission refusée",
      description: "Une nouvelle mission arrive bientôt.",
    });
  };

  const handleCall = (phoneNumber: string, clientName?: string, mission?: any) => {
    setActiveClient({
      name: clientName || 'Client',
      avatar: (clientName || 'Client').charAt(0),
      phone: phoneNumber,
      status: 'En ligne'
    });
    setCallInterface(true);
  };

  const handleVideoCall = () => {
    console.log("🎥 DÉMARRAGE APPEL VIDÉO");
    setCallActive(true);
    setCallType('video');
    setCallDuration(0);
    
    toast({
      title: "📹 Appel vidéo démarré",
      description: `Connexion vidéo avec ${activeClient?.name}`,
    });
    
    if (callTimer) clearInterval(callTimer);
    
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    setCallTimer(timer);
  };

  const handleVoiceCall = () => {
    console.log("📞 DÉMARRAGE APPEL VOCAL");
    setCallActive(true);
    setCallType('voice');
    setCallDuration(0);
    
    toast({
      title: "📞 Appel vocal démarré",
      description: `Connexion audio avec ${activeClient?.name}`,
    });
    
    if (callTimer) clearInterval(callTimer);
    
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    setCallTimer(timer);
  };

  const endCall = () => {
    console.log("🔴 FONCTION ENDCALL APPELÉE");
    
    if (callTimer) {
      console.log("🔴 NETTOYAGE TIMER");
      clearInterval(callTimer);
      setCallTimer(null);
    }
    
    console.log("🔴 RÉINITIALISATION ÉTATS");
    setCallActive(false);
    setCallType(null);
    setCallDuration(0);
    
    console.log("🔴 APPEL TERMINÉ AVEC SUCCÈS");
    
    toast({
      title: "📞 Appel terminé",
      description: "Vous avez raccroché avec succès",
    });
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Fichier sélectionné:", file.name, file.type, file.size);
      toast({
        title: "Fichier sélectionné",
        description: `Nom: ${file.name}, Type: ${file.type}`,
      });
    }
    setShowAttachments(false);
  };

  const handleCamera = () => {
    console.log("📸 Ouverture de la caméra...");
    toast({
      title: "Caméra",
      description: "Ouverture de la caméra...",
    });
    setShowAttachments(false);
  };

  const handleImage = () => {
    console.log("🖼️ Sélection d'une image depuis la galerie...");
    toast({
      title: "Galerie",
      description: "Sélection d'une image depuis la galerie...",
    });
    setShowAttachments(false);
  };

  const handleFile = () => {
    console.log("📁 Sélection d'un fichier...");
    toast({
      title: "Fichier",
      description: "Sélection d'un fichier...",
    });
    setShowAttachments(false);
  };

  const handleVideo = () => {
    console.log("🎬 Sélection d'une vidéo...");
    toast({
      title: "Vidéo",
      description: "Sélection d'une vidéo...",
    });
    setShowAttachments(false);
  };

  const handleDownload = () => {
    console.log("⬇️ Téléchargement du fichier...");
    toast({
      title: "Téléchargement",
      description: "Téléchargement du fichier...",
    });
    setShowAttachments(false);
  };

  const handlePlay = () => {
    console.log("▶️ Lecture du média...");
    toast({
      title: "Lecture",
      description: "Lecture du média...",
    });
  };

  const handlePause = () => {
    console.log("⏸️ Pause du média...");
    toast({
      title: "Pause",
      description: "Pause du média...",
    });
  };

  const startRecording = () => {
    console.log("🔴 Démarrage de l'enregistrement...");
    setIsRecording(true);
    toast({
      title: "Enregistrement",
      description: "Démarrage de l'enregistrement...",
    });
  };

  const stopRecording = () => {
    console.log("⏹️ Arrêt de l'enregistrement...");
    setIsRecording(false);
    toast({
      title: "Arrêt",
      description: "Arrêt de l'enregistrement...",
    });
  };

  const handleMicToggle = () => {
    console.log(isRecording ? "⏺️ Arrêt de l'enregistrement..." : "⏺️ Démarrage de l'enregistrement...");
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Arrêt" : "Enregistrement",
      description: isRecording ? "Arrêt de l'enregistrement..." : "Démarrage de l'enregistrement...",
    });
  };

  const handleMessage = (clientName: string, mission?: any) => {
    setActiveClient({
      name: clientName,
      avatar: clientName.charAt(0),
      phone: mission?.clientPhone || '+224 123 456 789',
      status: 'En ligne'
    });
    setChatMessages([
      {
        id: 1,
        text: "Bonjour ! Je suis votre livreur pour cette mission.",
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        sender: 'me'
      }
    ]);
    setChatOpen(true);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now(),
      text: newMessage,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      sender: 'me'
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
    
    setTimeout(() => {
      const autoReply = {
        id: Date.now() + 1,
        text: "Message reçu ! Merci pour l'information.",
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        sender: 'client'
      };
      setChatMessages(prev => [...prev, autoReply]);
    }, 1000);
  };

  const getMissionIcon = (type: string) => {
    switch (type) {
      case 'ride': return User;
      case 'delivery': return Package;
      default: return Car;
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'moto': 
      case 'scooter': 
      case 'velo': return Bike;
      case 'voiture': return Car;
      default: return Car;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {!fullView && (
        <>
          {/* Status Control Panel */}
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Statut du conducteur</h3>
                  <p className="text-muted-foreground text-sm">Gérez votre disponibilité</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Signal className="h-4 w-4 text-green-500" />
                    <Wifi className="h-4 w-4 text-green-500" />
                    <Battery className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="online-mode"
                    checked={driverStatus === "online"}
                    onCheckedChange={(checked) => onStatusChange(checked ? "online" : "offline")}
                  />
                  <Label htmlFor="online-mode" className="font-medium">Mode en ligne</Label>
                </div>
                
                <Button
                  onClick={() => onStatusChange(driverStatus === 'online' ? 'offline' : 'online')}
                  className={`${getStatusColor(driverStatus)} hover:opacity-80 text-white px-6 py-2 rounded-full transition-all duration-300`}
                >
                  <div className={`w-2 h-2 rounded-full bg-white mr-2 ${driverStatus === 'online' ? 'animate-pulse' : ''}`} />
                  {driverStatus === 'online' ? 'En ligne' : driverStatus === 'busy' ? 'Occupé' : 'Hors ligne'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Today's Performance */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Courses</p>
                    <p className="text-2xl font-bold text-primary">{todayStats.rides}</p>
                  </div>
                  <Car className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenus</p>
                    <p className="text-xl font-bold text-green-600">{todayStats.earnings}</p>
                    <p className="text-xs text-muted-foreground">GNF</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Note</p>
                    <p className="text-2xl font-bold text-yellow-600">{todayStats.rating}</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Heures</p>
                    <p className="text-2xl font-bold text-blue-600">{todayStats.hours}h</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Acceptation</p>
                    <p className="text-2xl font-bold text-purple-600">{todayStats.acceptanceRate}%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Live Missions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Missions en direct</CardTitle>
              <p className="text-muted-foreground">
                {missions.length} {missions.length === 1 ? 'mission disponible' : 'missions disponibles'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {driverStatus === 'offline' ? (
            <div className="text-center py-12">
              <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Mode hors ligne</h3>
              <p className="text-muted-foreground mb-4">
                Activez le mode en ligne pour recevoir des missions
              </p>
              <Button onClick={() => onStatusChange('online')}>
                <Zap className="h-4 w-4 mr-2" />
                Passer en ligne
              </Button>
            </div>
          ) : missions.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Recherche en cours...</h3>
              <p className="text-muted-foreground">
                Nous cherchons des missions dans votre zone
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {missions.map((mission) => {
                const MissionIcon = getMissionIcon(mission.type);
                const VehicleIcon = getVehicleIcon(mission.vehicleType);
                
                return (
                  <Card key={mission.id} className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <MissionIcon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{mission.client}</h3>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium">{mission.clientRating}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <VehicleIcon className="h-4 w-4" />
                              <span className="capitalize">{mission.vehicleType}</span>
                              {mission.surge && (
                                <Badge variant="destructive" className="text-xs">
                                  Forte demande {mission.surgeMultiplier}x
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{mission.price}</p>
                          <p className="text-sm text-muted-foreground">{mission.estimatedTime}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-green-700">Point de départ</p>
                              <p className="text-sm">{mission.pickup}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <Navigation className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-red-700">Destination</p>
                              <p className="text-sm">{mission.destination}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Navigation className="h-4 w-4" />
                            {mission.distance}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {mission.duration}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Paiement: {mission.paymentMethod === 'mobile_money' ? 'Mobile Money' : mission.paymentMethod === 'card' ? 'Carte' : 'Espèces'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button 
                          onClick={() => handleAcceptMission(mission)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          Accepter
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleRejectMission(mission.id)}
                          className="flex-1"
                        >
                          Refuser
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCall('+224 123 456 789', mission.client, mission)}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleMessage(mission.client, mission)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interface d'Appel WhatsApp SIMPLIFIÉE */}
      <Dialog open={callInterface} onOpenChange={setCallInterface}>
        <DialogContent className="sm:max-w-md h-[85vh] p-0 bg-[#f0f2f5]">
          <DialogHeader className="sr-only">
            <DialogTitle>Interface d'appel</DialogTitle>
            <DialogDescription>Interface pour gérer les appels avec le client</DialogDescription>
          </DialogHeader>
          
          {/* Header WhatsApp Style */}
          <div className="bg-[#075e54] text-white p-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCallInterface(false)}
              className="text-white hover:bg-white/10 h-8 w-8"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xl font-semibold">{activeClient?.avatar}</span>
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{activeClient?.name}</h3>
              <p className="text-sm text-green-100">{activeClient?.phone}</p>
            </div>
          </div>

          {/* Actions d'Appel */}
          <div className="p-6 space-y-6">
            {callActive ? (
              /* INTERFACE SIMPLIFIÉE QUI MARCHE */
              <div className="space-y-6">
                <div className="bg-green-100 p-6 rounded-lg text-center">
                  <h2 className="text-2xl font-bold text-green-800 mb-4">📞 APPEL EN COURS</h2>
                  
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl font-bold text-white">{activeClient?.avatar}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{activeClient?.name}</h3>
                  <p className="text-gray-700 mb-4">{activeClient?.phone}</p>
                  
                  <div className="bg-white px-6 py-3 rounded-full inline-block mb-4">
                    <span className="text-2xl font-mono text-green-600 font-bold">
                      {formatCallDuration(callDuration)}
                    </span>
                  </div>
                  
                  <p className="text-lg font-semibold text-green-700">
                    {callType === 'video' ? '📹 Appel vidéo' : '📞 Appel vocal'}
                  </p>
                </div>

                {/* BOUTONS ÉNORMES ET SIMPLES */}
                <div className="bg-white p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-center mb-6">CONTRÔLES</h3>
                  
                  <div className="flex justify-center gap-8 mb-6">
                    {/* Changer type d'appel */}
                    <div className="text-center">
                      <button
                        onClick={() => {
                          setCallType(callType === 'video' ? 'voice' : 'video');
                          console.log("Type changé:", callType === 'video' ? 'voice' : 'video');
                          toast({
                            title: callType === 'video' ? '📞 Audio' : '📹 Vidéo',
                            description: "Type d'appel modifié",
                          });
                        }}
                        className="w-20 h-20 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-3xl"
                      >
                        {callType === 'video' ? '📞' : '📹'}
                      </button>
                      <p className="mt-2 font-bold">
                        {callType === 'video' ? 'Audio' : 'Vidéo'}
                      </p>
                    </div>

                    {/* BOUTON RACCROCHER GÉANT */}
                    <div className="text-center">
                      <button
                        onClick={() => {
                          console.log("🔴 CLIC BOUTON RACCROCHER");
                          endCall();
                        }}
                        className="w-28 h-28 bg-red-500 hover:bg-red-600 text-white rounded-full text-5xl animate-pulse border-8 border-red-300"
                      >
                        ☎️
                      </button>
                      <p className="mt-2 font-bold text-red-600 text-lg">RACCROCHER</p>
                    </div>
                  </div>

                  {/* BOUTON D'URGENCE */}
                  <div className="text-center bg-red-50 p-4 rounded-lg border-2 border-red-300">
                    <p className="text-red-800 font-bold mb-3">Problème ? Utilisez ce bouton :</p>
                    <button
                      onClick={() => {
                        console.log("🚨 ARRÊT FORCÉ");
                        if (callTimer) {
                          clearInterval(callTimer);
                          setCallTimer(null);
                        }
                        setCallActive(false);
                        setCallType(null);
                        setCallDuration(0);
                        console.log("🚨 TOUT ARRÊTÉ");
                        toast({
                          title: "🚨 Appel arrêté",
                          description: "Arrêt forcé réussi",
                        });
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-xl"
                    >
                      🚨 ARRÊTER MAINTENANT 🚨
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Interface d'Appel Normale */
              <>
                <div className="text-center">
                  <div className="w-24 h-24 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl font-bold text-[#25D366]">{activeClient?.avatar}</span>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">{activeClient?.name}</h2>
                  <p className="text-gray-600">{activeClient?.phone}</p>
                </div>

                {/* Boutons d'Action Principaux */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={handleVoiceCall}
                    className="bg-[#25D366] hover:bg-[#128C7E] text-white h-16 flex-col gap-2 text-sm font-semibold"
                  >
                    <Phone className="h-6 w-6" />
                    Appel Vocal
                  </Button>
                  
                  <Button
                    onClick={handleVideoCall}
                    className="bg-[#075e54] hover:bg-[#128c7e] text-white h-16 flex-col gap-2 text-sm font-semibold"
                  >
                    <Video className="h-6 w-6" />
                    Appel Vidéo
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveMissions;
