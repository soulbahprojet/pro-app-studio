import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Grid,
  ShoppingCart,
  CreditCard,
  Truck,
  User,
  HelpCircle,
  Bell,
  ArrowLeft
} from 'lucide-react';

// Import des composants marketplace
import ClientMarketplaceHome from './ClientMarketplaceHome';
import ClientProductCatalog from './ClientProductCatalog';
import ClientCart from './ClientCart';
import ClientPayment from './ClientPayment';
import ClientDelivery from './ClientDelivery';
import ClientProfile from './ClientProfile';
import ClientSupport from './ClientSupport';

type MarketplaceTab = 'home' | 'catalog' | 'cart' | 'payment' | 'delivery' | 'profile' | 'support';

interface ClientMarketplaceInterfaceProps {
  onBack: () => void;
}

const ClientMarketplaceInterface: React.FC<ClientMarketplaceInterfaceProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<MarketplaceTab>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [notifications, setNotifications] = useState(3);

  const navigationTabs = [
    { id: 'home', name: 'Accueil', icon: Home, badge: null },
    { id: 'catalog', name: 'Catalogue', icon: Grid, badge: null },
    { id: 'cart', name: 'Panier', icon: ShoppingCart, badge: cartItems.length || null },
    { id: 'payment', name: 'Paiement', icon: CreditCard, badge: null },
    { id: 'delivery', name: 'Livraison', icon: Truck, badge: null },
    { id: 'profile', name: 'Profil', icon: User, badge: null },
    { id: 'support', name: 'Support', icon: HelpCircle, badge: null },
  ];

  const handleCategorySelect = (category: string) => {
    setActiveTab('catalog');
  };

  const handleProductClick = (productId: string) => {
    // Logique pour afficher les détails du produit
    console.log('Product clicked:', productId);
  };

  const handleAddToCart = (productId: string, quantity: number) => {
    // Simuler l'ajout au panier
    setCartItems(prev => [...prev, { productId, quantity }]);
    console.log('Added to cart:', productId, quantity);
  };

  const handleBuyNow = (productId: string) => {
    setActiveTab('payment');
    console.log('Buy now:', productId);
  };

  const handleProceedToPayment = (items: any[], total: number) => {
    setActiveTab('payment');
  };

  const handlePaymentComplete = (paymentData: any) => {
    setActiveTab('delivery');
  };

  const handleDeliverySelection = (option: any, address: any, fee: number) => {
    setActiveTab('home');
    // Logique pour confirmer la livraison
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <ClientMarketplaceHome
            onCategorySelect={handleCategorySelect}
            onProductClick={handleProductClick}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        );
      case 'catalog':
        return (
          <ClientProductCatalog
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        );
      case 'cart':
        return (
          <ClientCart
            onProceedToPayment={handleProceedToPayment}
            onCancelOrder={() => {}}
          />
        );
      case 'payment':
        return (
          <ClientPayment
            cartItems={cartItems}
            subtotal={0}
            onPaymentComplete={handlePaymentComplete}
            onGoBack={() => setActiveTab('cart')}
          />
        );
      case 'delivery':
        return (
          <ClientDelivery
            orderTotal={0}
            onDeliverySelection={handleDeliverySelection}
            onTrackOrder={() => {}}
          />
        );
      case 'profile':
        return <ClientProfile />;
      case 'support':
        return <ClientSupport />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* En-tête avec navigation principale */}
      <Card className="rounded-none border-b">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="lg:hidden"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="text-xl">
                🛒 Marketplace 224Solutions
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex">
        {/* Navigation latérale */}
        <Card className="w-64 min-h-screen rounded-none border-r bg-muted/30">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {navigationTabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <Button
                    key={tab.id}
                    variant={isActive ? 'default' : 'ghost'}
                    className={`w-full justify-start ${isActive ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => setActiveTab(tab.id as MarketplaceTab)}
                  >
                    <IconComponent className="w-4 h-4 mr-3" />
                    {tab.name}
                    {tab.badge && (
                      <Badge className="ml-auto" variant="secondary">
                        {tab.badge}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Contenu principal */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ClientMarketplaceInterface;