import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CourierInterface from '@/components/courier/CourierInterface';
import { Navigate } from 'react-router-dom';
import { AppDownloadBanner } from '@/components/AppDownloadBanner';

export default function CourierDashboardPage() {
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

  if (profile?.role !== 'courier') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-4">
      <AppDownloadBanner />
      <CourierInterface />
    </div>
  );
}