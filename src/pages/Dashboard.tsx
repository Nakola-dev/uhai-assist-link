// src/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  LogOut,
  AlertCircle,
  QrCode,
  Phone,
  Video,
  Shield,
  User,
  Heart,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import QRScanner from "@/components/QRScanner";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auth + Data Load
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth", { replace: true });
        return;
      }

      setUser(session.user);

      // Fetch profile (name + role)
      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", session.user.id)
        .single();

      setProfile(prof);
      setIsAdmin(prof?.role === "admin");

      // Fetch data
      await Promise.all([fetchOrganizations(), fetchTutorials()]);
      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate("/auth", { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchOrganizations = async () => {
    const { data } = await supabase
      .from("emergency_organizations")
      .select("*")
      .order("name");
    setOrganizations(data || []);
  };

  const fetchTutorials = async () => {
    const { data } = await supabase
      .from("tutorials")
      .select("*")
      .order("created_at", { ascending: false });
    setTutorials(data || []);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out" });
    navigate("/auth", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary-light/10 to-accent-light/10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const categories = ["CPR", "Choking", "Burns", "Bleeding", "Snake Bite"];
  const tutorialsByCategory = categories.map(cat => ({
    category: cat,
    tutorials: tutorials.filter(t => t.category === cat)
  })).filter(item => item.tutorials.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary-light/10 to-accent-light/10">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">UhaiLink Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                {profile?.full_name || user?.email}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/admin")}>
                <Shield className="h-4 w-4 mr-2" /> Admin
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8">

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Emergency */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 hover:shadow-emergency transition-all cursor-pointer group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-full bg-primary shadow-emergency">
                  <AlertCircle className="h-8 w-8 text-white animate-pulse" />
                </div>
                <Badge variant="destructive" className="text-xs font-bold">EMERGENCY</Badge>
              </div>
              <CardTitle className="text-2xl font-bold mt-4">Get Help Now</CardTitle>
              <CardDescription className="text-base">
                AI-powered first aid guidance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/assistant")}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-lg font-bold shadow-emergency"
              >
                Start AI Assistant
              </Button>
            </CardContent>
          </Card>

          {/* My QR */}
          <Card className="hover:shadow-card transition-all">
            <CardHeader>
              <div className="p-3 rounded-full bg-secondary/10 w-fit">
                <QrCode className="h-7 w-7 text-secondary" />
              </div>
              <CardTitle className="text-xl">My QR Code</CardTitle>
              <CardDescription>Download & print for emergencies</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard/user/qr")}>
                View QR Code
              </Button>
            </CardContent>
          </Card>

          {/* Profile */}
          <Card className="hover:shadow-card transition-all">
            <CardHeader>
              <div className="p-3 rounded-full bg-accent/10 w-fit">
                <User className="h-7 w-7 text-accent" />
              </div>
              <CardTitle className="text-xl">My Profile</CardTitle>
              <CardDescription>Medical info & contacts</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard/user/profile")}>
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* First Aid Tutorials */}
        {tutorialsByCategory.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <Video className="h-8 w-8 text-primary" />
                  First Aid Tutorials
                </h2>
                <p className="text-muted-foreground mt-1">Learn life-saving skills</p>
              </div>
            </div>
            <div className="space-y-8">
              {tutorialsByCategory.map(({ category, tutorials: catTuts }) => (
                <div key={category}>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Badge variant="outline">{category}</Badge>
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {catTuts.map((t) => (
                      <Card
                        key={t.id}
                        className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                        onClick={() => window.open(t.video_url, "_blank")}
                      >
                        {t.thumbnail && (
                          <div className="aspect-video bg-muted relative overflow-hidden">
                            <img
                              src={t.thumbnail}
                              alt={t.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <div className="p-4 rounded-full bg-primary/80">
                                <Video className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          </div>
                        )}
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base line-clamp-2">{t.title}</CardTitle>
                          <CardDescription className="text-sm line-clamp-2">
                            {t.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Emergency Contacts */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Phone className="h-8 w-8 text-primary" />
                Emergency Services
              </h2>
              <p className="text-muted-foreground mt-1">Hospitals & rescue in Kenya</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org) => (
              <Card key={org.id} className="hover:shadow-lg transition-all group cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="text-xs">{org.type}</Badge>
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{org.name}</CardTitle>
                  <CardDescription className="text-sm">{org.location}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a
                    href={`tel:${org.phone}`}
                    className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <Phone className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-primary">{org.phone}</span>
                  </a>
                  {org.website && (
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      Website →
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;