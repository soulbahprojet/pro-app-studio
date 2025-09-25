import React from 'react';
import { useParams } from 'react-router-dom';
import BureauSyndicatDashboard from '@/components/syndicat/BureauSyndicatDashboard';
import TravailleurDashboard from '@/components/syndicat/TravailleurDashboard';
import Layout from '@/components/Layout';

const SyndicatInterface: React.FC = () => {
  const { type, token } = useParams<{ type: string; token: string }>();

  return (
    <Layout showNavigation={false}>
      <div className="min-h-screen bg-background">
        {type === 'bureau' && token && (
          <BureauSyndicatDashboard bureauToken={token} />
        )}
        {type === 'travailleur' && token && (
          <TravailleurDashboard travailleurToken={token} />
        )}
        {!token && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Accès Refusé</h1>
              <p>Token d'authentification manquant ou invalide</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SyndicatInterface;