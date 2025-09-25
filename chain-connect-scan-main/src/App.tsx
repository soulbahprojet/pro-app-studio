import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { FirebaseProvider } from "./contexts/FirebaseContext";
import { useAutoSetCurrency } from "./hooks/useAutoSetCurrency";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRedirect from "./components/RoleBasedRedirect";
import SecurityMiddleware from "./middleware/SecurityMiddleware";
import StrictSecurityGuard from "./middleware/StrictSecurityGuard";
import StrictRoleEnforcer from "./middleware/StrictRoleEnforcer";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import Wallet from "./pages/Wallet";
import SimpleAuth from "./pages/SimpleAuth";
import AdminAuth from "./pages/AdminAuth";
import PDGLogin from "./pages/PDGLogin";
import QuickAuth from "./pages/QuickAuth";
import StaffProLogin from "./pages/StaffProLogin";
import PDGDashboard from "./pages/PDGDashboard";
import PDGDashboardSecure from "./pages/PDGDashboardSecure";
import AdminDashboard from "./pages/AdminDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import DigitalStore from "./pages/DigitalStore";
import DigitalStoreDashboard from "./components/digital-store/DigitalStoreDashboard";
import TrackingDashboard from "./pages/TrackingDashboard";
import ProfileDashboard from "./pages/ProfileDashboard";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ClientHome from "./pages/ClientHome";
import NearbyServices from "./pages/NearbyServices";
import ClientCheckout from "./pages/ClientCheckout";
import OrderTracking from "./pages/OrderTracking";
import ClientMessages from "./pages/ClientMessages";
import ClientFavorites from "./pages/ClientFavorites";
import UnifiedMessages from "./pages/UnifiedMessages";
import DeliveryInterface from "./pages/DeliveryInterface";
import Services from "./pages/Services";
import GPSTracker from "./pages/GPSTracker";
import VendorAuth from "./pages/VendorAuth";
import VendorDashboardPage from "./pages/VendorDashboard";
import NewShipment from "./pages/NewShipment";
import ShipmentTracking from "./pages/ShipmentTracking";
import ShipmentHistory from "./pages/ShipmentHistory";
import FreightDashboardPage from "./pages/FreightDashboardPage";
import VirtualCards from "./pages/VirtualCards";
import SyndicatBureau from "./pages/SyndicatBureau";
import MotoDashboardPage from "./pages/MotoDashboardPage";
import CourierDashboardPage from "./pages/CourierDashboardPage";
import UnionDashboard from "./components/union/UnionDashboard";
import StripeSubscriptions from "./pages/StripeSubscriptions";
// Imports des modules spécialisés
import CourierInterface from "./components/delivery/CourierInterface";
import TaxiMotoInterface from "./components/taxi-moto/TaxiMotoInterface";
import FreightInterface from "./components/freight/FreightInterface";
import CallScreen from "./pages/CallScreen";
import AgoraTestDashboard from "./pages/AgoraTestDashboard";
import MapScreen from "./pages/MapScreen";
import DeliveryTestScreen from "./pages/DeliveryTestScreen";
import ComprehensiveTestDashboard from "./pages/ComprehensiveTestDashboard";
import SecurityTestDashboard from "./components/security/SecurityTestDashboard";
import SecurityAuditLogger from "./components/security/SecurityAuditLogger";
import SecurityTestSuite from "./test/SecurityTestSuite";
import ComprehensiveRoleAudit from "./components/audit/ComprehensiveRoleAudit";
import NonRegressionTestSuite from "./components/test/NonRegressionTestSuite";
import SecurityDashboard from "./pages/SecurityDashboard";
import FeaturesActivationPage from "./pages/FeaturesActivation";
import { DeepAnalysisProvider } from "./components/DeepAnalysisProvider";
import SyndicatInterface from "./pages/SyndicatInterface";


const queryClient = new QueryClient();

// Composant interne pour gérer l'auto-attribution de devise
function CurrencyManager() {
  useAutoSetCurrency();
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FirebaseProvider>
          <DeepAnalysisProvider>
            <CurrencyManager />
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <SecurityMiddleware>
                <RoleBasedRedirect>
                  <SecurityAuditLogger />
                <Routes>
                {/* Pages publiques (sans restriction de rôle) */}
                <Route path="/" element={<Layout><Index /></Layout>} />
                <Route path="/auth" element={<Layout showNavigation={false}><SimpleAuth /></Layout>} />
                <Route path="/client-auth" element={<Layout showNavigation={false}><Auth /></Layout>} />
                <Route path="/vendor-auth" element={<VendorAuth />} />
                <Route path="/admin-auth" element={<AdminAuth />} />
                <Route path="/pdg-login" element={<PDGLogin />} />
                <Route path="/quick-auth" element={<QuickAuth />} />

                {/* Routes CLIENT */}
                <Route 
                  path="/client-home" 
                  element={
                    <Layout>
                      <ClientHome />
                    </Layout>
                  } 
                />
                <Route 
                  path="/marketplace" 
                  element={
                    <ProtectedRoute allowedRoles={['client', 'seller', 'courier', 'transitaire', 'taxi_moto']}>
                      <Layout>
                        <Marketplace />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/services" 
                  element={
                    <Layout>
                      <Services />
                    </Layout>
                  } 
                />
                <Route 
                  path="/nearby-services" 
                  element={
                    <Layout>
                      <NearbyServices />
                    </Layout>
                  } 
                />
                <Route 
                  path="/tracking" 
                  element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <Layout>
                        <TrackingDashboard />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/wallet" 
                  element={
                    <ProtectedRoute>
                      <Wallet />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/virtual-cards" 
                  element={
                    <ProtectedRoute>
                      <VirtualCards />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/client-favorites" 
                  element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <Layout>
                        <ClientFavorites />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/favorites" 
                  element={<Navigate to="/client-favorites" replace />} 
                />
                <Route 
                  path="/orders" 
                  element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <Layout>
                        <OrderTracking />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/digital-store" 
                  element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <Layout>
                        <DigitalStore />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />

                {/* Routes SELLER */}
                <Route 
                  path="/vendor-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['seller']}>
                      <VendorDashboardPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Routes COURIER */}
                <Route 
                  path="/courier-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['courier']}>
                      <CourierDashboardPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Routes TAXI MOTO */}
                <Route 
                  path="/moto-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['taxi_moto']}>
                      <MotoDashboardPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Routes TRANSITAIRE */}
                <Route 
                  path="/freight" 
                  element={
                    <ProtectedRoute allowedRoles={['transitaire']}>
                      <FreightDashboardPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Routes ADMIN */}
                <Route 
                  path="/admin-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/pdg-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <PDGDashboardSecure />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/interfacepdg224gn" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <PDGDashboardSecure />
                    </ProtectedRoute>
                  } 
                />

                {/* Routes COMMUNES (tous les rôles authentifiés) */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfileDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/syndicat-bureau" 
                  element={
                    <ProtectedRoute>
                      <Layout showNavigation={false}>
                        <SyndicatBureau />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                 {/* Route de test du système */}
                 <Route 
                   path="/security-test" 
                   element={
                     <ProtectedRoute>
                       <Layout>
                         <SecurityTestDashboard />
                       </Layout>
                     </ProtectedRoute>
                   } 
                 />
                 
                 {/* Route de validation de séparation des rôles */}
                 <Route 
                   path="/role-security-validation" 
                   element={
                     <ProtectedRoute>
                       <Layout>
                         <SecurityTestSuite />
                       </Layout>
                     </ProtectedRoute>
                   } 
                 />
                 
                 {/* Route d'audit complet RCA */}
                 <Route 
                   path="/comprehensive-audit" 
                   element={
                     <ProtectedRoute>
                       <Layout>
                         <ComprehensiveRoleAudit />
                       </Layout>
                     </ProtectedRoute>
                   } 
                 />
                 
                  {/* Route de tests non-régression */}
                  <Route 
                    path="/non-regression-tests" 
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <NonRegressionTestSuite />
                        </Layout>
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Route du tableau de bord sécurité OpenAI */}
                  <Route 
                    path="/security-dashboard" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <Layout>
                          <SecurityDashboard />
                        </Layout>
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Route d'activation des fonctionnalités */}
                  <Route 
                    path="/features-activation" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <Layout>
                          <FeaturesActivationPage />
                        </Layout>
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Routes du système syndical */}
                  <Route 
                    path="/syndicat/:type/:token" 
                    element={
                      <ProtectedRoute>
                        <SyndicatInterface />
                      </ProtectedRoute>
                    } 
                  />

                {/* Route 404 */}
                <Route path="*" element={<NotFound />} />
                </Routes>
                </RoleBasedRedirect>
              </SecurityMiddleware>
            </BrowserRouter>
          </TooltipProvider>
          </DeepAnalysisProvider>
        </FirebaseProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;