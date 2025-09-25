import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import heroImage from "@/assets/hero-marketplace.jpg";

const Hero = () => {
  return (
    <section className="pt-24 pb-16 px-4">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            
            {/* Accès direct au Dashboard Marchand */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 rounded-xl shadow-xl">
              <h2 className="text-xl font-bold mb-3">🛍️ Dashboard Marchand Actif</h2>
              <p className="text-emerald-100 mb-4">Vous êtes connecté en tant que marchand. Accédez à vos fonctionnalités :</p>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/seller-dashboard">
                  <Button className="w-full bg-white text-emerald-600 hover:bg-emerald-50">
                    📊 Dashboard Principal
                  </Button>
                </Link>
                <Link to="/digital-store">
                  <Button className="w-full bg-white text-emerald-600 hover:bg-emerald-50">
                    💻 Boutique Digitale
                  </Button>
                </Link>
                <Link to="/marketplace">
                  <Button className="w-full bg-white text-emerald-600 hover:bg-emerald-50">
                    🏪 Marketplace
                  </Button>
                </Link>
                <Link to="/wallet">
                  <Button className="w-full bg-white text-emerald-600 hover:bg-emerald-50">
                    💰 Portefeuille
                  </Button>
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-hero bg-clip-text text-transparent">
                  Digital Commerce
                </span>
                <br />
                <span className="text-foreground">
                  Simplified for Africa
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Connect sellers, buyers, and delivery partners in one powerful platform. 
                Complete with digital wallets, QR authentication, and real-time tracking.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/marketplace">
                <Button variant="hero" size="lg" className="text-lg px-8">
                  Start Selling
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8">
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Accès rapide Vendeur */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm font-medium text-green-600 mb-2">🛍️ Accès Marchand (Test)</p>
              <p className="text-xs text-muted-foreground mb-3">
                Email: <code className="bg-background px-1 rounded">fusiondigitaleltd@gmail.com</code><br />
                Mot de passe: <code className="bg-background px-1 rounded">Stb@h661794582</code>
              </p>
              <Link to="/auth">
                <Button variant="outline" size="sm" className="border-green-500/20 hover:bg-green-500/10">
                  Dashboard Marchand
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Active Merchants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">500K+</div>
                <div className="text-sm text-muted-foreground">Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-glow">15+</div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-elegant">
              <img 
                src={heroImage} 
                alt="Digital marketplace platform showing African commerce"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-accent rounded-full shadow-accent animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-primary rounded-full shadow-glow animate-pulse delay-75"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
