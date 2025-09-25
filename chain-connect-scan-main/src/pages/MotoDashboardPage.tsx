import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MotoTaxiInterface from '@/components/moto-taxi/MotoTaxiInterface';
import { Navigate } from 'react-router-dom';

export default function MotoDashboardPage() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profile?.role !== 'taxi_moto' && !(profile?.role === 'courier' && profile?.vehicle_type === 'moto')) {
    return <Navigate to="/" replace />;
  }

  return <MotoTaxiInterface />;
}