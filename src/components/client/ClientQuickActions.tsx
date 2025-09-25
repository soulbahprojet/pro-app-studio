import { Button } from "../ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  History, 
  CreditCard, 
  Wallet, 
  ArrowRight
} from "lucide-react";

const ClientQuickActions = () => {
  const navigate = useNavigate();

  // Fonctions pour gérer les actions rapides
  const handleQuickAction = (action: string) => {
    switch (action) {
      case "Favoris":
        navigate("/favorites");
        toast.success("Redirection vers vos favoris");
        break;
      case "Historique de commandes":
        navigate("/orders");
        toast.info("Historique de commandes ouvert");
        break;
      case "Méthodes de paiement":
        toast.info("Gestion des méthodes de paiement");
        break;
      case "Portefeuille":
        navigate("/wallet");  
        toast.success("Redirection vers le portefeuille");
        break;
      default:
        toast.info(`Action: ${action}`);
    }
  };

  const quickActions = [
    { icon: Heart, label: "Favoris", color: "text-red-500" },
    { icon: History, label: "Historique de commandes", color: "text-blue-500" },
    { icon: CreditCard, label: "Méthodes de paiement", color: "text-green-500" },
    { icon: Wallet, label: "Portefeuille", color: "text-purple-500" }
  ];

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Actions rapides</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => toast.info("Voir toutes les actions")}
        >
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
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

export default ClientQuickActions;
