import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogoutModal = ({ isOpen, onClose }: LogoutModalProps) => {
  const { user, profile, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm border border-border shadow-2xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-foreground mb-4">
            Déconnexion
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-6">
          {/* Informations utilisateur en superposition */}
          <div className="relative p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
            <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
              <User className="w-4 h-4" />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-foreground">
                {profile?.full_name || "Souleymane Bah"}
              </h3>
              
              <div className="text-sm text-muted-foreground">
                <p className="font-mono bg-muted/50 px-3 py-1 rounded">
                  ID: {user?.id?.slice(0, 8) || "12345678"}
                </p>
              </div>
              
              <div className="text-sm">
                <span className="inline-block bg-secondary text-secondary-foreground px-3 py-1 rounded-full capitalize">
                  {profile?.role || 'client'}
                </span>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground">
            Êtes-vous sûr de vouloir vous déconnecter ?
          </p>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutModal;