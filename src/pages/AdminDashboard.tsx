import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  LogOut,
  Building2,
  Video,
  Plus,
  Edit,
  Trash2,
  Users,
  Activity,
  LayoutDashboard
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { checkAdminAccess } from "@/lib/auth-utils";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [tutDialogOpen, setTutDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<any>(null);
  const [editingTut, setEditingTut] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    const hasAccess = await checkAdminAccess(session.user.id);

    if (!hasAccess) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive"
      });
      navigate("/dashboard");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
    fetchData();
    fetchUserCount();
  };

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

  const fetchUserCount = async () => {
    const { count } = await supabase
      .from("user_roles")
      .select("*", { count: "exact", head: true });
    setUserCount(count || 0);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
    navigate("/");
  };

  const handleOrgSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      phone: formData.get("phone") as string,
      location: formData.get("location") as string,
      website: formData.get("website") as string || null,
    };

    if (editingOrg) {
      const { error } = await supabase
        .from("emergency_organizations")
        .update(data)
        .eq("id", editingOrg.id);
      if (error) {
        toast({ title: "Error updating organization", variant: "destructive" });
      } else {
        toast({ title: "Organization updated successfully" });
      }
    } else {
      const { error } = await supabase
        .from("emergency_organizations")
        .insert([data]);
      if (error) {
        toast({ title: "Error adding organization", variant: "destructive" });
      } else {
        toast({ title: "Organization added successfully" });
      }
    }

    setOrgDialogOpen(false);
    setEditingOrg(null);
    fetchData();
  };

  const handleTutSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      video_url: formData.get("video_url") as string,
      category: formData.get("category") as string,
      thumbnail: formData.get("thumbnail") as string || null,
    };

    if (editingTut) {
      const { error } = await supabase
        .from("tutorials")
        .update(data)
        .eq("id", editingTut.id);
      if (error) {
        toast({ title: "Error updating tutorial", variant: "destructive" });
      } else {
        toast({ title: "Tutorial updated successfully" });
      }
    } else {
      const { error } = await supabase
        .from("tutorials")
        .insert([data]);
      if (error) {
        toast({ title: "Error adding tutorial", variant: "destructive" });
      } else {
        toast({ title: "Tutorial added successfully" });
      }
    }

    setTutDialogOpen(false);
    setEditingTut(null);
    fetchData();
  };

  const handleDeleteOrg = async (id: string) => {
    if (!confirm("Are you sure you want to delete this organization?")) return;
    const { error } = await supabase
      .from("emergency_organizations")
      .delete()
      .eq("id", id);
    if (error) {
      toast({ title: "Error deleting organization", variant: "destructive" });
    } else {
      toast({ title: "Organization deleted successfully" });
      fetchData();
    }
  };

  const handleDeleteTut = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tutorial?")) return;
    const { error } = await supabase
      .from("tutorials")
      .delete()
      .eq("id", id);
    if (error) {
      toast({ title: "Error deleting tutorial", variant: "destructive" });
    } else {
      toast({ title: "Tutorial deleted successfully" });
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary-light/10 to-accent-light/10">
        <div className="animate-pulse">
          <Shield className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary-light/10 to-accent-light/10">
      <header className="border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Control Panel</h1>
              <p className="text-xs text-muted-foreground">Manage system settings and content</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/user")}>
              <Activity className="h-4 w-4 mr-2" />
              User View
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-semibold text-muted-foreground uppercase">
                Total Users
              </CardDescription>
              <CardTitle className="text-4xl font-bold text-primary">
                {userCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Registered accounts
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-secondary">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-semibold text-muted-foreground uppercase">
                Emergency Contacts
              </CardDescription>
              <CardTitle className="text-4xl font-bold text-secondary">
                {organizations.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Active organizations
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-semibold text-muted-foreground uppercase">
                Tutorials
              </CardDescription>
              <CardTitle className="text-4xl font-bold text-accent">
                {tutorials.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Video className="h-4 w-4" />
                First aid videos
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="organizations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="organizations" className="text-base">
              <Building2 className="h-5 w-5 mr-2" />
              Emergency Organizations
            </TabsTrigger>
            <TabsTrigger value="tutorials" className="text-base">
              <Video className="h-5 w-5 mr-2" />
              First Aid Tutorials
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organizations" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl">Emergency Organizations</CardTitle>
                    <CardDescription className="mt-1">
                      Manage hospital and emergency service contacts
                    </CardDescription>
                  </div>
                  <Dialog open={orgDialogOpen} onOpenChange={setOrgDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => setEditingOrg(null)}
                        size="lg"
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Organization
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-xl">
                          {editingOrg ? "Edit" : "Add"} Organization
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleOrgSubmit} className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Organization Name</Label>
                          <Input
                            id="name"
                            name="name"
                            defaultValue={editingOrg?.name}
                            placeholder="Kenyatta National Hospital"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="type">Type</Label>
                          <Input
                            id="type"
                            name="type"
                            defaultValue={editingOrg?.type}
                            placeholder="Hospital, Emergency Services, etc."
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            defaultValue={editingOrg?.phone}
                            placeholder="+254-20-2726300"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            name="location"
                            defaultValue={editingOrg?.location}
                            placeholder="Hospital Road, Nairobi"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website (Optional)</Label>
                          <Input
                            id="website"
                            name="website"
                            type="url"
                            defaultValue={editingOrg?.website}
                            placeholder="https://example.com"
                          />
                        </div>
                        <Button type="submit" className="w-full" size="lg">
                          {editingOrg ? "Update" : "Add"} Organization
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Name</TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold">Phone</TableHead>
                        <TableHead className="font-semibold">Location</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {organizations.map((org) => (
                        <TableRow key={org.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{org.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{org.type}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{org.phone}</TableCell>
                          <TableCell className="text-sm">{org.location}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingOrg(org);
                                  setOrgDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteOrg(org.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tutorials" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl">First Aid Tutorials</CardTitle>
                    <CardDescription className="mt-1">
                      Manage educational video content
                    </CardDescription>
                  </div>
                  <Dialog open={tutDialogOpen} onOpenChange={setTutDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => setEditingTut(null)}
                        size="lg"
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Tutorial
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl">
                          {editingTut ? "Edit" : "Add"} Tutorial
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleTutSubmit} className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Tutorial Title</Label>
                          <Input
                            id="title"
                            name="title"
                            defaultValue={editingTut?.title}
                            placeholder="CPR - Cardiopulmonary Resuscitation"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            name="description"
                            defaultValue={editingTut?.description}
                            placeholder="Learn how to perform CPR..."
                            rows={3}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="video_url">Video URL</Label>
                          <Input
                            id="video_url"
                            name="video_url"
                            type="url"
                            defaultValue={editingTut?.video_url}
                            placeholder="https://www.youtube.com/watch?v=..."
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            name="category"
                            defaultValue={editingTut?.category}
                            placeholder="CPR, Choking, Burns, etc."
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="thumbnail">Thumbnail URL (Optional)</Label>
                          <Input
                            id="thumbnail"
                            name="thumbnail"
                            type="url"
                            defaultValue={editingTut?.thumbnail}
                            placeholder="https://img.youtube.com/vi/..."
                          />
                        </div>
                        <Button type="submit" className="w-full" size="lg">
                          {editingTut ? "Update" : "Add"} Tutorial
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Title</TableHead>
                        <TableHead className="font-semibold">Category</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tutorials.map((tut) => (
                        <TableRow key={tut.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium max-w-xs">{tut.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{tut.category}</Badge>
                          </TableCell>
                          <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                            {tut.description}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingTut(tut);
                                  setTutDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTut(tut.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
