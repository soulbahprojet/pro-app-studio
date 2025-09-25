import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const VendorSalesStats = () => {
  const navigate = useNavigate();

  // Fonction pour gérer les statistiques de ventes
  const handleSalesStat = (stat: any) => {
    if (stat.count > 0) {
      // Navigation vers une page détaillée selon le statut
      switch (stat.status) {
        case "pending_orders":
          navigate("/seller-dashboard?tab=orders&status=pending");
          toast.success(`📦 ${stat.count} commandes en attente - Traitez vos nouvelles commandes`);
          break;
        case "processing_orders":
          navigate("/seller-dashboard?tab=orders&status=processing");
          toast.info(`⏳ ${stat.count} commandes en préparation - Suivez le processus de traitement`);
          break;
        case "shipped_orders":
          navigate("/seller-dashboard?tab=orders&status=shipped");
          toast.info(`🚚 ${stat.count} commandes expédiées - Commandes en cours de livraison`);
          break;
        case "low_stock":
          navigate("/seller-dashboard?tab=products&filter=low-stock");
          toast.warning(`⚠️ ${stat.count} produits en stock faible - Réapprovisionnez rapidement`);
          break;
        default:
          navigate("/seller-dashboard");
          toast.info(`${stat.label}: ${stat.count}`);
      }
    } else {
      toast.info(`${stat.icon} ${stat.description}`);
    }
  };

  // Fonction pour gérer les sections
  const handleSectionClick = (section: string) => {
    switch (section) {
      case "Mes ventes":
        navigate("/seller-dashboard?tab=orders");
        toast.success("Redirection vers vos ventes");
        break;
      default:
        toast.info(`Section: ${section}`);
    }
  };

  // ⚠️ SÉCURITÉ: Ces données doivent être récupérées de la base de données pour le vendeur connecté uniquement
  const salesStats = [
    { 
      label: "Nouvelles commandes", 
      count: 0, // TODO: Récupérer depuis orders où seller_id = auth.uid() AND status = 'pending'
      color: "bg-blue-500",
      icon: "📦",
      description: "Aucune nouvelle commande",
      status: "pending_orders"
    },
    { 
      label: "En préparation", 
      count: 0, // TODO: Récupérer depuis orders où seller_id = auth.uid() AND status = 'processing'
      color: "bg-orange-500",
      icon: "⏳",
      description: "Aucune commande en préparation",
      status: "processing_orders"
    },
    { 
      label: "Expédiées", 
      count: 0, // TODO: Récupérer depuis orders où seller_id = auth.uid() AND status = 'shipped'
      color: "bg-green-500",
      icon: "🚚",
      description: "Aucune commande expédiée aujourd'hui",
      status: "shipped_orders"
    },
    { 
      label: "Stock faible", 
      count: 0, // TODO: Récupérer depuis products où seller_id = auth.uid() AND stock_quantity < 10
      color: "bg-red-500",
      icon: "⚠️",
      description: "Tous vos produits sont bien approvisionnés",
      status: "low_stock"
    }
  ];

  return (
    <div className="px-4 py-6 bg-accent/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Tableau de Bord Vendeur</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => handleSectionClick("Mes ventes")}
        >
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {salesStats.map((stat, index) => (
          <Button
            key={index}
            variant="ghost"
            className="flex flex-col items-center p-4 h-auto space-y-2 hover:bg-accent/10 border border-transparent hover:border-primary/20 rounded-lg transition-all duration-200"
            onClick={() => handleSalesStat(stat)}
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

export default VendorSalesStats;
