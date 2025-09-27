import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Truck, 
  MapPin, 
  Building2, 
  Globe, 
  User,
  Menu,
  Bell,
  Search
} from 'lucide-react';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Accueil', icon: <Home size={18} /> },
    { path: '/marketplace', label: 'Marketplace', icon: <ShoppingCart size={18} /> },
    { path: '/vendor-dashboard', label: 'Vendeur', icon: <Package size={18} /> },
    { path: '/delivery-dashboard', label: 'Livraison', icon: <Truck size={18} /> },
    { path: '/transport-dashboard', label: 'Transport', icon: <MapPin size={18} /> },
    { path: '/syndicat-bureau', label: 'Bureau', icon: <Building2 size={18} /> },
    { path: '/freight-dashboard', label: 'Transitaire', icon: <Globe size={18} /> }
  ];

  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">224</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Solutions</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActivePath(item.path) 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart size={18} />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">
                  3
                </span>
              </Button>
            </Link>

            <Link to="/login">
              <Button size="sm">Connexion</Button>
            </Link>

            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu size={18} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
