import { useAuth } from "@/contexts/AuthContext";
import ClientProfileDashboard from "@/components/client/ClientProfileDashboard";
import VendorProfileDashboard from "@/components/vendor/VendorProfileDashboard";
import { Navigate } from "react-router-dom";

const ProfileDashboard = () => {
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

  // Afficher l'interface appropriée selon le rôle
  switch (profile?.role) {
    case 'client':
      return <ClientProfileDashboard />;
    case 'seller':
      return <VendorProfileDashboard />;
    case 'courier':
      return <Navigate to="/courier-dashboard" replace />;
    case 'transitaire':
      return <Navigate to="/freight-dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin-dashboard" replace />;
    case 'taxi_moto':
      return <Navigate to="/moto-dashboard" replace />;
    default:
      // Par défaut, afficher l'interface client
      return <ClientProfileDashboard />;
  }
};

export default ProfileDashboard;