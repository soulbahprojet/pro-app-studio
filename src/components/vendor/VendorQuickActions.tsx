import { Button } from "../../ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Wallet, 
  Settings,
  ArrowRight
} from "lucide-react";

const VendorQuickActions = () => {
  const navigate = useNavigate();

  // Fonctions pour gérer les actions rapides vendeur
  const handleQuickAction = (action: string) => {
    switch (action) {
      case "Ajouter Produit":
        navigate("/seller-dashboard?tab=products&action=add");
        toast.success("Redirection vers l'ajout de produit");
        break;
      case "Commandes":
        navigate("/seller-dashboard?tab=orders");
        toast.info("Gestion des commandes ouverte");
        break;
      case "Analyses":
        navigate("/seller-dashboard?tab=analytics");
        toast.info("Tableau de bord des analyses");
        break;
      case "Portefeuille":
        navigate("/wallet");  
        toast.success("Redirection vers le portefeuille vendeur");
        break;
      case "Paramètres":
        navigate("/seller-dashboard?tab=settings");
        toast.info("Paramètres de la boutique");
        break;
      default:
        toast.info(`Action: ${action}`);
    }
  };

  const quickActions = [
    { icon: Package, label: "Ajouter Produit", color: "text-blue-500" },
    { icon: ShoppingCart, label: "Commandes", color: "text-orange-500" },
    { icon: BarChart3, label: "Analyses", color: "text-green-500" },
    { icon: Wallet, label: "Portefeuille", color: "text-purple-500" },
    { icon: Settings, label: "Paramètres", color: "text-gray-500" }
  ];

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Actions Rapides</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => toast.info("Voir toutes les actions")}
        >
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
      
      <div className="grid grid-cols-5 gap-4">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className="flex flex-col items-center p-4 h-auto space-y-2 hover:bg-accent/50"
            onClick={() => handleQuickAction(action.label)}
          >
            <action.icon className={`h-6 w-6 ${action.color}`} />
            <span className="text-xs text-center text-muted-foreground leading-tight">
              {action.label}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default VendorQuickActions;
