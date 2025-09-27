import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './pages/ClientHome';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Payment from './pages/Payment';
import DeliveryDashboard from './pages/DeliveryDashboard';
import TransportDashboard from './pages/TransportDashboard';
import Profile from './pages/Profile';
import VendorDashboard from './pages/VendorDashboard';
import VendorProductsPage from './pages/vendor/VendorProductsPage';
import VendorCustomersPage from './pages/vendor/VendorCustomersPage';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/layout/Header';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8 max-w-7xl">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/services" element={<Services />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/delivery-dashboard" element={<ProtectedRoute><DeliveryDashboard /></ProtectedRoute>} />
              <Route path="/transport-dashboard" element={<ProtectedRoute><TransportDashboard /></ProtectedRoute>} />
              <Route path="/vendor-dashboard" element={<ProtectedRoute><VendorDashboard /></ProtectedRoute>} />
              <Route path="/vendor/products" element={<ProtectedRoute><VendorProductsPage /></ProtectedRoute>} />
              <Route path="/vendor/customers" element={<ProtectedRoute><VendorCustomersPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
          </main>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
