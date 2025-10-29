import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Activity, LogOut, User, Heart, Phone, QrCode, MessageSquare, Building2, Video, ExternalLink, Shield } from "lucide-react";
import MedicalProfileForm from "@/components/MedicalProfileForm";
import EmergencyContactsForm from "@/components/EmergencyContactsForm";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      
      // Check admin status
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      setIsAdmin(!!roleData);
      setLoading(false);
      
      // Fetch organizations and tutorials
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <Activity className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary-light/10 to-accent-light/10">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">UhaiLink Dashboard</h1>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="outline" onClick={() => navigate("/admin")}>
                <Shield className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            )}
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">
            Manage your medical profile and emergency information
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Medical Info
            </TabsTrigger>
            <TabsTrigger value="contacts">
              <Phone className="h-4 w-4 mr-2" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="qr">
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </TabsTrigger>
            <TabsTrigger value="emergency">
              <MessageSquare className="h-4 w-4 mr-2" />
              Emergency AI
            </TabsTrigger>
            <TabsTrigger value="organizations">
              <Building2 className="h-4 w-4 mr-2" />
              Emergency Help
            </TabsTrigger>
            <TabsTrigger value="tutorials">
              <Video className="h-4 w-4 mr-2" />
              Tutorials
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Medical Profile
                </CardTitle>
                <CardDescription>
                  This information will be accessible to first responders via your QR code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MedicalProfileForm userId={user?.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Emergency Contacts
                </CardTitle>
                <CardDescription>
                  Add people who should be contacted in case of emergency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmergencyContactsForm userId={user?.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr">
            <QRCodeDisplay userId={user?.id} />
          </TabsContent>

          <TabsContent value="emergency">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  AI Emergency Assistant
                </CardTitle>
                <CardDescription>
                  Get immediate first aid guidance for emergency situations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate("/emergency-chat")}
                  className="w-full"
                >
                  Start Emergency Chat
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organizations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Emergency Organizations
                </CardTitle>
                <CardDescription>
                  Quick access to emergency services and hospitals in Kenya
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {organizations.map((org) => (
                    <Card key={org.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{org.name}</CardTitle>
                          <Badge variant="secondary">{org.type}</Badge>
                        </div>
                        <CardDescription>{org.location}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <a 
                          href={`tel:${org.phone}`}
                          className="flex items-center gap-2 text-primary hover:underline font-medium"
                        >
                          <Phone className="h-4 w-4" />
                          {org.phone}
                        </a>
                        {org.website && (
                          <a 
                            href={org.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Visit Website
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tutorials">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  First Aid Tutorials
                </CardTitle>
                <CardDescription>
                  Learn essential first aid skills through video tutorials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {tutorials.map((tutorial) => (
                    <Card key={tutorial.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      {tutorial.thumbnail && (
                        <div className="aspect-video w-full bg-muted">
                          <img 
                            src={tutorial.thumbnail} 
                            alt={tutorial.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <Badge variant="outline" className="w-fit mb-2">
                          {tutorial.category}
                        </Badge>
                        <CardTitle className="text-base">{tutorial.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {tutorial.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => window.open(tutorial.video_url, '_blank')}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Watch Tutorial
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
