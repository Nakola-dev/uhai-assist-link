import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Shield, Smartphone, QrCode, MessageSquare } from "lucide-react";
import Layout from "@/components/Layout";
import { HeroSlider } from "@/components/HeroSlider";

const Index = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen">
        <HeroSlider />

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

      </div>
    </Layout>
  );
};

export default Index;
