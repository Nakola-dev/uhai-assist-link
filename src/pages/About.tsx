import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Heart, Shield, Users, Zap, MapPin, Clock } from "lucide-react";
import Layout from "@/components/Layout";

const About = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-glow to-accent py-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                About UhaiLink
              </h1>
              <p className="text-xl text-white/90">
                Solving Kenya & Africa's Emergency Response Challenges with AI Innovation
              </p>
            </div>
          </div>
        </section>

        {/* Problem Statement */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">The Challenge We're Solving</h2>
              
              <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                <p>
                  Across Kenya and Africa, countless lives are lost every year because medical help arrives too late or bystanders lack critical first aid knowledge. In rural and urban areas alike, emergency response faces unique challenges:
                </p>

                <div className="grid md:grid-cols-2 gap-6 my-8">
                  <div className="p-6 rounded-xl border bg-card">
                    <Clock className="h-10 w-10 text-primary mb-4" />
                    <h3 className="font-bold text-lg mb-2 text-foreground">Delayed Response</h3>
                    <p className="text-sm">
                      Average emergency response times in Kenya range from 30 minutes to several hours, especially in remote areas.
                    </p>
                  </div>

                  <div className="p-6 rounded-xl border bg-card">
                    <Users className="h-10 w-10 text-secondary mb-4" />
                    <h3 className="font-bold text-lg mb-2 text-foreground">Limited Training</h3>
                    <p className="text-sm">
                      Most bystanders lack basic first aid knowledge, leaving victims without immediate care during critical golden minutes.
                    </p>
                  </div>

                  <div className="p-6 rounded-xl border bg-card">
                    <Shield className="h-10 w-10 text-accent mb-4" />
                    <h3 className="font-bold text-lg mb-2 text-foreground">Missing Medical Data</h3>
                    <p className="text-sm">
                      Patient medical information (allergies, blood type, conditions) is often inaccessible to responders when it matters most.
                    </p>
                  </div>

                  <div className="p-6 rounded-xl border bg-card">
                    <MapPin className="h-10 w-10 text-primary mb-4" />
                    <h3 className="font-bold text-lg mb-2 text-foreground">Poor Coordination</h3>
                    <p className="text-sm">
                      Emergency contacts are difficult to reach, and nearby hospitals aren't notified quickly enough.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Solution */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Our Solution</h2>
              
              <div className="space-y-6 text-muted-foreground">
                <p className="text-lg">
                  UhaiLink is Kenya's first AI-powered emergency response platform designed specifically for African challenges. We combine cutting-edge artificial intelligence with practical, accessible technology to save lives.
                </p>

                <div className="grid md:grid-cols-3 gap-6 my-8">
                  <div className="text-center p-6">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-bold mb-2">AI-Guided First Aid</h3>
                    <p className="text-sm text-muted-foreground">
                      Instant, step-by-step emergency instructions adapted for African context
                    </p>
                  </div>

                  <div className="text-center p-6">
                    <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-8 w-8 text-secondary" />
                    </div>
                    <h3 className="font-bold mb-2">Secure QR Profiles</h3>
                    <p className="text-sm text-muted-foreground">
                      Encrypted medical wristbands provide instant access to vital patient data
                    </p>
                  </div>

                  <div className="text-center p-6">
                    <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="font-bold mb-2">Mobile-First</h3>
                    <p className="text-sm text-muted-foreground">
                      Works anywhere with limited connectivity, optimized for African networks
                    </p>
                  </div>
                </div>

                <p className="text-lg">
                  Built by Africans, for Africans — UhaiLink understands the unique infrastructure, cultural, and economic realities of emergency response in Kenya and across the continent.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-secondary to-secondary-light">
          <div className="container mx-auto px-4 text-center">
            <Heart className="h-16 w-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Join the Movement to Save Lives
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Every profile created, every responder trained, every second saved — together, we're building a safer Africa.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-white text-secondary hover:bg-white/90 text-lg px-8 py-6"
            >
              Get Started Free
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
