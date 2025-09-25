import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import FeaturesActivationDashboard from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import { Alert, AlertDescription } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';

const FeaturesActivationPage: React.FC = () => {
  const { profile, user } = useAuth();

  // Vérifier que l'utilisateur est admin
  if (!user || !profile || profile.role !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Accès restreint. Cette page est réservée aux administrateurs.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FeaturesActivationDashboard />
    </div>
  );
};

export default FeaturesActivationPage;
