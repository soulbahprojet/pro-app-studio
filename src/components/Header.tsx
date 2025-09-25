import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingBag, Wallet, MapPin, QrCode, Globe, User, LogOut, Heart, CreditCard, Truck } from "lucide-react";
import { useState } from "react";
import LogoutModal from "./LogoutModal";
import UberStyleInterface from './delivery/UberStyleInterface';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

const Header = () => {
  const { user, profile, logout, isAuthenticated } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [headerDeliveryOpen, setHeaderDeliveryOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo et navigation */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
              <Globe className="h-8 w-8" />
              224Solutions
            </Link>
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                {/* Boutons de navigation rapide */}
                <Link to="/marketplace">
                  <Button variant="ghost" size="sm" className="hidden md:flex">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Marketplace
                  </Button>
                </Link>
                
                <Link to="/wallet">
                  <Button variant="ghost" size="sm" className="hidden md:flex">
                    <Wallet className="h-4 w-4 mr-2" />
                    Portefeuille
                  </Button>
                </Link>
                
                <Link to="/virtual-cards">
                  <Button variant="ghost" size="sm" className="hidden md:flex">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Carte Virtuelle
                  </Button>
                </Link>


                {/* Bouton utilisateur avec menu déroulant */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center gap-2 hover:bg-secondary"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">{profile?.full_name || 'Utilisateur'}</span>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    Connexion
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de déconnexion */}
      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
      />
    </header>
  );
};

export default Header;
