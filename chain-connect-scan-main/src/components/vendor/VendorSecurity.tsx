import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, AlertTriangle } from 'lucide-react';

interface VendorSecurityProps {
  userProfile: any;
}

const VendorSecurity: React.FC<VendorSecurityProps> = ({ userProfile }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sécurité & Sauvegarde
          </CardTitle>
          <CardDescription>
            Paramètres de sécurité et gestion des sauvegardes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Module sécurité en cours de développement...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorSecurity;