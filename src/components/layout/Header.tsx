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
import { useAuth } from '@/hooks/useAuth';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { 
      path: '/', 
      label: 'Accueil', 
      icon: <Home size={18} />,
      roles: ['all']
    },
    { 
      path: '/marketplace', 
      label: 'Marketplace', 
      icon: <ShoppingCart size={18} />,
      roles: ['client', 'all']
    },
    { 
      path: '/vendor-dashboard', 
      label: 'Vendeur', 
      icon: <Package size={18} />,
      roles: ['vendor', 'all']
    },
    { 
      path: '/delivery-dashboard', 
      label: 'Livraison', 
      icon: <Truck size={18} />,
      roles: ['courier', 'all']
    },
    { 
      path: '/transport-dashboard', 
      label: 'Transport', 
      icon: <MapPin size={18} />,
      roles: ['driver', 'all']
    },
    { 
      path: '/syndicat-bureau', 
      label: 'Bureau', 
      icon: <Building2 size={18} />,
      roles: ['admin', 'bureau', 'all']
    },
    { 
      path: '/freight-dashboard', 
      label: 'Transitaire', 
      icon: <Globe size={18} />,
      roles: ['freight', 'all']
    }
  ];

  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo et Titre */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">224</span>
              </div>
              <span className="text-xl font-bold text-foreground">Solutions</span>
            </Link>
          </div>

          {/* Navigation principale */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActivePath(item.path) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-3">
            {/* Recherche */}
            <Button variant="ghost" size="sm" className="hidden lg:flex">
              <Search size={18} />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
            </Button>

            {/* Panier */}
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart size={18} />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                  3
                </span>
              </Button>
            </Link>

            {/* Profil utilisateur */}
            {user ? (
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  <User size={18} />
                  <span className="hidden lg:ml-2 lg:inline">{user.email?.split('@')[0]}</span>
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="sm">Connexion</Button>
              </Link>
            )}

            {/* Menu mobile */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu size={18} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
