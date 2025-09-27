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
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Accueil', icon: '🏠' },
    { path: '/marketplace', label: 'Marketplace', icon: '🛒' },
    { path: '/vendor-dashboard', label: 'Vendeur', icon: '🏪' },
    { path: '/delivery-dashboard', label: 'Livraison', icon: '🚚' },
    { path: '/transport-dashboard', label: 'Moto-Taxi', icon: '🏍️' },
    { path: '/syndicat-bureau', label: 'Bureau', icon: '🏢' },
    { path: '/freight-dashboard', label: 'Transitaire', icon: '🌍' }
  ];

  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      width: '100%',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        <div style={{
          display: 'flex',
          height: '4rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <div 
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '0.5rem',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}>
              224
            </div>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>
              Solutions
            </span>
          </div>

          {/* Navigation */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            flexWrap: 'wrap'
          }}>
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: isActivePath(item.path) ? '#3b82f6' : 'transparent',
                  color: isActivePath(item.path) ? 'white' : '#6b7280'
                }}
                onMouseEnter={(e) => {
                  if (!isActivePath(item.path)) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.color = '#1f2937';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActivePath(item.path)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#6b7280';
                  }
                }}
              >
                <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <button
              onClick={() => navigate('/cart')}
              style={{
                position: 'relative',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                color: '#6b7280',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1f2937'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              🛒
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '1.25rem',
                height: '1.25rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '50%',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                3
              </span>
            </button>
            
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                backgroundColor: '#3b82f6',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              Connexion
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
