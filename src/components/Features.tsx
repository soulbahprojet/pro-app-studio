import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { 
  ShoppingBag, 
  Wallet, 
  MapPin, 
  QrCode, 
  Globe, 
  Shield,
  Smartphone,
  Users,
  Navigation,
  Bike
} from "lucide-react";

const features = [
  {
    icon: ShoppingBag,
    title: "Marketplace Platform",
    description: "Connect with thousands of buyers and sellers across Africa. List products, manage inventory, and grow your business.",
    gradient: "bg-gradient-primary"
  },
  {
    icon: Wallet,
    title: "Digital Wallet",
    description: "Secure multi-currency wallet with instant payments, transaction history, and seamless money transfers.",
    gradient: "bg-gradient-accent"
  },
  {
    icon: Navigation,
    title: "Géolocalisation & Proximité",
    description: "Trouvez facilement les magasins, taxis-motos et services à proximité avec notre système de géolocalisation avancé.",
    gradient: "bg-gradient-primary"
  },
  {
    icon: MapPin,
    title: "Delivery Tracking",
    description: "Real-time GPS tracking for all deliveries. Transparent logistics with estimated arrival times.",
    gradient: "bg-gradient-accent"
  },
  {
    icon: QrCode,
    title: "QR Authentication",
    description: "Secure product verification and payment processing using advanced QR code technology.",
    gradient: "bg-gradient-primary"
  },
  {
    icon: Bike,
    title: "Transport & Livraison",
    description: "Réservation de taxis-motos, livraisons express et suivi en temps réel de vos commandes.",
    gradient: "bg-gradient-accent"
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description: "Available in local languages with automatic translation for seamless communication.",
    gradient: "bg-gradient-primary"
  },
  {
    icon: Shield,
    title: "Secure Transactions",
    description: "Bank-level security with end-to-end encryption and fraud protection for all transactions.",
    gradient: "bg-gradient-accent"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Everything You Need
            </span>
            <br />
            <span className="text-foreground">to Succeed Online</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and services needed 
            to build a thriving digital business in the African market.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 bg-gradient-card border-0 shadow-elegant hover:shadow-glow transition-smooth group">
              <div className="space-y-6">
                <div className={`w-16 h-16 ${feature.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-bounce`}>
                  <feature.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-card-foreground group-hover:text-primary transition-smooth">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="hero" size="lg" className="text-lg px-8">
            Explore All Features
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Features;
