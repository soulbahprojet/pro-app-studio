import { Button } from "../ui/button";
import { ArrowRight, Download } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="relative rounded-3xl bg-gradient-hero p-12 lg:p-16 text-center overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary-foreground/10 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-primary-foreground/10 rounded-full translate-x-20 translate-y-20"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-accent-glow/20 rounded-full"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-6xl font-bold text-primary-foreground leading-tight">
              Ready to Transform Your Business?
            </h2>
            
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
              Join thousands of African entrepreneurs who are already growing their 
              businesses with our comprehensive digital commerce platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Button variant="accent" size="lg" className="text-lg px-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Download className="w-5 h-5" />
                Download App
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-8 pt-8 text-primary-foreground/80">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent-glow rounded-full"></div>
                <span>Free 30-day trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent-glow rounded-full"></div>
                <span>No setup fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent-glow rounded-full"></div>
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
