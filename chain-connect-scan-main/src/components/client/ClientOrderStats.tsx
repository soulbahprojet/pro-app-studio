import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const ClientOrderStats = () => {
  const navigate = useNavigate();

  // Fonction pour gérer les statistiques de commandes avec suivi détaillé
  const handleOrderStat = (stat: any) => {
    if (stat.count > 0) {
      // Navigation vers une page de suivi détaillée selon le statut
      switch (stat.status) {
        case "payment_pending":
          navigate("/orders?status=payment");
          toast.success(`💳 ${stat.count} articles en attente de paiement - Cliquez pour finaliser vos achats`);
          break;
        case "shipping_pending":
          navigate("/orders?status=shipping");
          toast.info(`📦 ${stat.count} commandes prêtes - Vos articles sont en préparation d'expédition`);
          break;
        case "delivery_pending":
          navigate("/orders?status=delivery");
          toast.info(`🚚 ${stat.count} articles en livraison - Suivez le trajet de vos colis en temps réel`);
          break;
        case "review_pending":
          navigate("/orders?status=review");
          toast.success(`⭐ ${stat.count} articles livrés - Évaluez vos achats et partagez votre expérience`);
          break;
        default:
          navigate("/orders");
          toast.info(`${stat.label}: ${stat.count} commandes`);
      }
    } else {
      toast.info(`${stat.icon} Aucun article dans cette catégorie - ${stat.description}`);
    }
  };

  // Fonction pour gérer les sections
  const handleSectionClick = (section: string) => {
    switch (section) {
      case "Mes commandes":
        navigate("/orders");
        toast.success("Redirection vers vos commandes");
        break;
      default:
        toast.info(`Section: ${section}`);
    }
  };

  // ⚠️ SÉCURITÉ: Ces données doivent être récupérées de la base de données pour l'utilisateur connecté uniquement
  const userStats = [
    { 
      label: "Paiement en attente", 
      count: 0, // TODO: Récupérer depuis orders où customer_id = auth.uid()
      color: "bg-orange-500",
      icon: "💳",
      description: "Articles en attente de paiement",
      status: "payment_pending"
    },
    { 
      label: "Envoi en attente", 
      count: 0, // TODO: Récupérer depuis orders où customer_id = auth.uid()
      color: "bg-blue-500",
      icon: "📦",
      description: "Commandes prêtes à être expédiées",
      status: "shipping_pending"
    },
    { 
      label: "En attente de réception", 
      count: 0, // TODO: Récupérer depuis orders où customer_id = auth.uid()
      color: "bg-green-500",
      icon: "🚚",
      description: "Articles en cours de livraison",
      status: "delivery_pending"
    },
    { 
      label: "En attente d'évaluation", 
      count: 0, // TODO: Récupérer depuis orders où customer_id = auth.uid()
      color: "bg-purple-500",
      icon: "⭐",
      description: "Articles livrés à évaluer",
      status: "review_pending"
    }
  ];

  return (
    <div className="px-4 py-6 bg-accent/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Mes commandes</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => handleSectionClick("Mes commandes")}
        >
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {userStats.map((stat, index) => (
          <Button
            key={index}
            variant="ghost"
            className="flex flex-col items-center p-4 h-auto space-y-2 hover:bg-accent/10 border border-transparent hover:border-primary/20 rounded-lg transition-all duration-200"
            onClick={() => handleOrderStat(stat)}
          >
            <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center mb-2`}>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <Badge variant="secondary" className="mb-1 bg-white/80">
              {stat.count}
            </Badge>
            <div className="text-xs text-muted-foreground leading-tight text-center font-medium">
              {stat.label}
            </div>
            <div className="text-xs text-muted-foreground/80 text-center">
              {stat.description}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ClientOrderStats;