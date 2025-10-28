import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Activity, Heart, Shield, Smartphone, QrCode, MessageSquare } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-glow to-accent min-h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
              <Activity className="h-5 w-5" />
              <span className="font-medium">AI-Powered Emergency Response</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Saving Lives with
              <span className="block text-accent">Instant Medical Access</span>
            </h1>
            
            <p className="text-xl mb-8 text-white/90">
              UhaiLink provides AI-guided first aid assistance and secure medical data access through QR-coded wristbands. When every second counts, we're here to help.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 shadow-emergency"
              >
                Get Started Free
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/emergency-chat")}
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Emergency Chat
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How UhaiLink Saves Lives</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Designed for Africa's unique challenges, built with cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-xl border bg-card hover:shadow-card transition-all">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI First Aid Assistant</h3>
              <p className="text-muted-foreground">
                Get step-by-step emergency guidance instantly, adapted for African context
              </p>
            </div>

            <div className="p-6 rounded-xl border bg-card hover:shadow-card transition-all">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <QrCode className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">QR Medical Wristband</h3>
              <p className="text-muted-foreground">
                Instant access to vital medical info - blood type, allergies, conditions
              </p>
            </div>

            <div className="p-6 rounded-xl border bg-card hover:shadow-card transition-all">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure & Encrypted</h3>
              <p className="text-muted-foreground">
                Military-grade encryption protects your sensitive medical data
              </p>
            </div>

            <div className="p-6 rounded-xl border bg-card hover:shadow-card transition-all">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Mobile-First</h3>
              <p className="text-muted-foreground">
                Works anywhere, anytime - even with limited connectivity
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-secondary to-secondary-light">
        <div className="container mx-auto px-4 text-center">
          <Heart className="h-16 w-16 text-white mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-4">
            Join Thousands Protecting Their Lives
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Create your medical profile in 5 minutes. It could save your life.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-white text-secondary hover:bg-white/90 text-lg px-8 py-6"
          >
            Create Free Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">UhaiLink</span>
          </div>
          <p className="text-sm">
            Saving lives across Africa, one QR code at a time.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
