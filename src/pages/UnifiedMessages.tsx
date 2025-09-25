import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MessengerInterface from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        

const UnifiedMessages = () => {
  const { user } = useAuth();
  
  // Déterminer le rôle utilisateur depuis le profil
  const getUserRole = () => {
    // Ici, on pourrait récupérer le rôle depuis la base de données
    // Pour l'instant, on utilise une logique simple basée sur l'email ou d'autres critères
    if (user?.email?.includes('seller') || user?.email?.includes('marchand')) {
      return 'seller';
    } else if (user?.email?.includes('courier') || user?.email?.includes('livreur')) {
      return 'courier';
    }
    return 'client';
  };

  return (
    <MessengerInterface userRole={getUserRole()} />
  );
};

export default UnifiedMessages;
