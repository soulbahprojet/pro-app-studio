import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';

export default function ClientHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header de navigation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '3rem',
        padding: '1rem',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}>
            224
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            224SOLUTIONS
          </h1>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/')} style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}>🏠 Accueil</button>
          
          <button onClick={() => navigate('/marketplace')} style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}>🛒 Marché</button>
          
          <button onClick={() => navigate('/services')} style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}>🔧 Services</button>
        </div>
      </div>

      {/* Contenu principal */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem'
        }}>
          Choisissez votre profil professionnel
        </h2>
        <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '2rem' }}>
          Commerce et services
        </p>
      </div>

      {/* Grille des profils */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Client */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center',
          border: '2px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
            Client
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Acheter des produits et services
          </p>
          <button 
            onClick={() => navigate('/marketplace')}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Accéder au Marketplace
          </button>
        </div>

        {/* Marchand */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center',
          border: '2px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
            Marchand
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Gérer une boutique en ligne
          </p>
          <button 
            onClick={() => navigate('/vendor-dashboard')}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Dashboard Vendeur
          </button>
        </div>

        {/* Services */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center',
          border: '2px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛠️</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
            Nos services
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Explorer par catégories
          </p>
          <button 
            onClick={() => navigate('/services')}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Voir les Services
          </button>
        </div>

        {/* Livraison */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center',
          border: '2px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚚</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
            Livraison
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Services de proximité
          </p>
          <button 
            onClick={() => navigate('/delivery-dashboard')}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Dashboard Livreur
          </button>
        </div>

        {/* Transport */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center',
          border: '2px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏍️</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
            Moto-Taxi
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Transport de personnes
          </p>
          <button 
            onClick={() => navigate('/transport-dashboard')}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Dashboard Chauffeur
          </button>
        </div>

        {/* Bureau */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center',
          border: '2px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
            Bureau Syndicat
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Administration
          </p>
          <button 
            onClick={() => navigate('/syndicat-bureau')}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Dashboard Bureau
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem',
        backgroundColor: '#f9fafb',
        borderRadius: '0.5rem',
        marginTop: '2rem'
      }}>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Authentication avec Supabase
        </p>
        {user ? (
          <p style={{ color: '#10b981', fontWeight: '500', marginTop: '0.5rem' }}>
            ✅ Connecté en tant que {user.email}
          </p>
        ) : (
          <div style={{ marginTop: '1rem' }}>
            <button 
              onClick={() => navigate('/login')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                marginRight: '0.5rem'
              }}
            >
              Se connecter
            </button>
            <button 
              onClick={() => navigate('/register')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              S'inscrire
            </button>
          </div>
        )}
      </div>
    </div>
  );
}