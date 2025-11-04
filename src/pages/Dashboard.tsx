// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Phone, Mail, Shield, Activity, AlertCircle, QrCode, User, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  full_name: string;
  role: string;
}

interface Organization {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  video_url: string;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  /* --------------------------------------------------------------
   * 1. Initialize Dashboard (Auth + Data + Error Resilience)
   * ------------------------------------------------------------ */
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Get session
        const { data: { session }, error: sessionError } = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Session timeout")), 5000))
        ]);

        if (sessionError || !session) {
          console.error("Session error:", sessionError);
          toast({ title: "Session expired", description: "Please sign in again.", variant: "destructive" });
          navigate("/auth", { replace: true });
          return;
        }

        setUser(session.user);

        // 2. Fetch profile (RLS-safe)
        const { data: prof, error: profError } = await Promise.race([
          supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", session.user.id)
            .maybeSingle(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Profile timeout")), 5000))
        ]);

        if (profError && profError.code !== "PGRST116") {
          console.error("Profile fetch error:", profError);
          toast({ title: "Profile Error", description: profError.message, variant: "destructive" });
        }

        const defaultProfile = { full_name: session.user.email?.split("@")[0] || "User", role: "user" };
        const finalProfile = prof || defaultProfile;
        setProfile(finalProfile);
        setIsAdmin(finalProfile.role === "admin");

        // 3. Fetch public data (non-blocking)
        const [orgResult, tutResult] = await Promise.allSettled([
          supabase.from("emergency_organizations").select("*").limit(6),
          supabase.from("tutorials").select("*").limit(3)
        ]);

        if (orgResult.status === "fulfilled") {
          setOrganizations(orgResult.value.data || []);
        } else {
          console.error("Organizations fetch failed:", orgResult.reason);
          toast({ title: "Failed to load emergency contacts", variant: "destructive" });
        }

        if (tutResult.status === "fulfilled") {
          setTutorials(tutResult.value.data || []);
        } else {
          console.error("Tutorials fetch failed:", tutResult.reason);
        }

      } catch (err: any) {
        console.error("Dashboard init error:", err);
        setError(err.message || "Failed to load dashboard");
        toast({ title: "Load Failed", description: "Please refresh the page.", variant: "destructive" });
      } finally {
        setLoading(false); // ALWAYS set to false
      }
    };

    init();

    // Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        navigate("/auth", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  /* --------------------------------------------------------------
   * 2. Sign Out (with timeout)
   * ------------------------------------------------------------ */
  const handleSignOut = async () => {
    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Sign out timeout")), 5000))
      ]);
      toast({ title: "Signed out successfully" });
      navigate("/auth", { replace: true });
    } catch (err: any) {
      console.error("Sign out error:", err);
      toast({ variant: "destructive", title: "Sign out failed", description: "Redirecting anyway..." });
      navigate("/auth", { replace: true });
    }
  };

  /* --------------------------------------------------------------
   * 3. Loading UI
   * ------------------------------------------------------------ */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary-light/5 to-accent-light/5">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------
   * 4. Error UI
   * ------------------------------------------------------------ */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="mt-2">
            <p className="font-semibold">Dashboard unavailable</p>
            <p className="text-sm">{error}</p>
            <Button className="mt-4 w-full" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  /* --------------------------------------------------------------
   * 5. Main Dashboard UI
   * ------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary-light/5 to-accent-light/5">
      {/* Hero Section */}
      <section className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl">
                  {profile?.full_name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {profile?.full_name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={isAdmin ? "default" : "secondary"}>
                    {isAdmin ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                    {isAdmin ? "Admin" : "User"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => navigate("/dashboard/user/profile")} size="sm">
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button onClick={() => navigate("/dashboard/user/qr")} size="sm">
                <QrCode className="h-4 w-4 mr-2" />
                My QR Code
              </Button>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {organizations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {organizations.map((org) => (
                  <div
                    key={org.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-semibold">{org.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{org.type}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <Phone className="h-4 w-4 text-green-600" />
                      <a href={`tel:${org.phone}`} className="hover:underline">
                        {org.phone}
                      </a>
                    </div>
                    {org.email && (
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <a href={`mailto:${org.email}`} className="hover:underline">
                          {org.email}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No emergency contacts available.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Tutorials */}
      <section className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              How to Use UhaiLink
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tutorials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tutorials.map((tut) => (
                  <div
                    key={tut.id}
                    className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <Activity className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold">{tut.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{tut.description}</p>
                      {tut.video_url && (
                        <a
                          href={tut.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline"
                        >
                          Watch Video
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No tutorials available.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;