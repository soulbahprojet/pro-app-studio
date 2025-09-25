import { useState } from "react";
import EnhancedMarketplace from "@/components/EnhancedMarketplace";
import FloatingHomeButton from "@/components/FloatingHomeButton";
import LogisticsServiceButtons from "@/components/LogisticsServiceButtons";
import UberStyleInterface from "@/components/delivery/UberStyleInterface";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingCart, Package2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Marketplace = () => {
  const [marketplaceDeliveryOpen, setMarketplaceDeliveryOpen] = useState(false);
  const { profile } = useAuth();

  return (
    <div className="relative">
      {/* Services Logistiques en haut */}
      <div className="bg-background border-b p-4">
        <h2 className="text-lg font-bold mb-3 text-foreground">Services Logistiques</h2>
        <LogisticsServiceButtons />
      </div>
      
      <EnhancedMarketplace />
      <FloatingHomeButton />
      
      {/* Bouton Livreur uniquement pour taxi moto */}
      {profile?.role === 'taxi_moto' && (
        <Dialog open={marketplaceDeliveryOpen} onOpenChange={setMarketplaceDeliveryOpen}>
          <DialogTrigger asChild>
            <Button 
              className="fixed bottom-20 right-4 z-50 w-18 h-18 rounded-xl bg-gradient-to-tr from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 text-white shadow-2xl border-2 border-white hover:scale-105 transition-all duration-300"
              title="🛒 Livraison Express Marketplace"
            >
              <div className="flex flex-col items-center p-2">
                <Package2 className="h-5 w-5 mb-1" />
                <span className="text-xs font-semibold">SHOP</span>
              </div>
            </Button>
        </DialogTrigger>
        <DialogContent className="max-w-7xl h-[90vh] p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Livraison Express Marketplace</DialogTitle>
          </DialogHeader>
          <UberStyleInterface />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Marketplace;