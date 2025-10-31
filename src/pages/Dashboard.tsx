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
  Heart
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [tutorials, setTutorials] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();
      setIsAdmin(profile?.role === "admin");
      setLoading(false);

      fetchData();
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchData = async () => {
    const { data: orgs } = await supabase
      .from("emergency_organizations")
      .select("*")
      .order("name");

    const { data: tuts } = await supabase
      .from("tutorials")
      .select("*")
      .order("created_at", { ascending: false });

    setOrganizations(orgs || []);
    setTutorials(tuts || []);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary-light/10 to-accent-light/10">
        <div className="animate-pulse">
          <Activity className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  const categories = ["CPR", "Choking", "Burns", "Bleeding", "Snake Bite"];
  const tutorialsByCategory = categories.map(cat => ({
    category: cat,
    tutorials: tutorials.filter(t => t.category === cat)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary-light/10 to-accent-light/10">
      <header className="border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">UhaiLink Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                {user?.user_metadata?.full_name || user?.email}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/admin")}>
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 hover:shadow-emergency transition-all cursor-pointer group col-span-full md:col-span-2 lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-full bg-primary shadow-emergency">
                  <AlertCircle className="h-8 w-8 text-white animate-pulse" />
                </div>
                <Badge variant="destructive" className="text-xs font-bold">
                  EMERGENCY
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold mt-4">Get Help Now</CardTitle>
              <CardDescription className="text-base">
                AI-powered emergency assistance available 24/7
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/assistant")}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-lg font-bold shadow-emergency group-hover:scale-105 transition-transform"
              >
                Start Emergency Assistant
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-all cursor-pointer" onClick={() => navigate("/dashboard")}>
            <CardHeader>
              <div className="p-3 rounded-full bg-secondary/10 w-fit">
                <QrCode className="h-7 w-7 text-secondary" />
              </div>
              <CardTitle className="text-xl">Scan QR Code</CardTitle>
              <CardDescription>
                Access medical profile instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Open Camera
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-all">
            <CardHeader>
              <div className="p-3 rounded-full bg-accent/10 w-fit">
                <User className="h-7 w-7 text-accent" />
              </div>
              <CardTitle className="text-xl">My Profile</CardTitle>
              <CardDescription>
                Medical info & QR download
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => navigate("/profileview")}>
                View Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Video className="h-8 w-8 text-primary" />
                First Aid Tutorials
              </h2>
              <p className="text-muted-foreground mt-1">
                Learn life-saving skills through video guides
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {tutorialsByCategory.map(({ category, tutorials: catTutorials }) => (
              catTutorials.length > 0 && (
                <div key={category}>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                      {category}
                    </Badge>
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {catTutorials.map((tutorial) => (
                      <Card
                        key={tutorial.id}
                        className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                        onClick={() => window.open(https:www.youtube.com/watch?v=NxO5LvgqZe0, "BLEEDING")}
                      >
                        {tutorial.thumbnail && (
                          <div className="aspect-video w-full bg-muted relative overflow-hidden">
                            <img
                              src={tutorial.thumbnail}
                              alt={tutorial.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <div className="p-4 rounded-full bg-primary shadow-emergency">
                                <Video className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="text-base line-clamp-2">
                            {tutorial.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 text-sm">
                            {tutorial.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Phone className="h-8 w-8 text-primary" />
                Emergency Contacts
              </h2>
              <p className="text-muted-foreground mt-1">
                Quick access to hospitals and emergency services in Kenya
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org) => (
              <Card
                key={org.id}
                className="hover:shadow-lg transition-all group cursor-pointer"
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {org.type}
                    </Badge>
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{org.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {org.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a
                    href={`tel:${org.phone}`}
                    className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors group"
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
                      Visit Website →
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
