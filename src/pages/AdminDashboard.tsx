import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, LogOut, Building2, Video, Plus, Edit, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [tutDialogOpen, setTutDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<any>(null);
  const [editingTut, setEditingTut] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      toast({ title: "Access denied", description: "Admin access required", variant: "destructive" });
      navigate("/dashboard");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
    fetchData();
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
      website: formData.get("website") as string,
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
      thumbnail: formData.get("thumbnail") as string,
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <Shield className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary-light/10 to-accent-light/10">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              User Dashboard
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="organizations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="organizations">
              <Building2 className="h-4 w-4 mr-2" />
              Emergency Organizations
            </TabsTrigger>
            <TabsTrigger value="tutorials">
              <Video className="h-4 w-4 mr-2" />
              First Aid Tutorials
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organizations">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Manage Emergency Organizations</CardTitle>
                    <CardDescription>Add, edit, or delete emergency contact organizations</CardDescription>
                  </div>
                  <Dialog open={orgDialogOpen} onOpenChange={setOrgDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingOrg(null)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Organization
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingOrg ? "Edit" : "Add"} Organization</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleOrgSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" name="name" defaultValue={editingOrg?.name} required />
                        </div>
                        <div>
                          <Label htmlFor="type">Type</Label>
                          <Input id="type" name="type" defaultValue={editingOrg?.type} placeholder="Hospital, Red Cross, etc." required />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" name="phone" defaultValue={editingOrg?.phone} required />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input id="location" name="location" defaultValue={editingOrg?.location} required />
                        </div>
                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input id="website" name="website" type="url" defaultValue={editingOrg?.website} />
                        </div>
                        <Button type="submit" className="w-full">
                          {editingOrg ? "Update" : "Add"} Organization
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">{org.name}</TableCell>
                        <TableCell>{org.type}</TableCell>
                        <TableCell>{org.phone}</TableCell>
                        <TableCell>{org.location}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
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
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tutorials">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Manage First Aid Tutorials</CardTitle>
                    <CardDescription>Add, edit, or delete first aid video tutorials</CardDescription>
                  </div>
                  <Dialog open={tutDialogOpen} onOpenChange={setTutDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingTut(null)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Tutorial
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingTut ? "Edit" : "Add"} Tutorial</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleTutSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input id="title" name="title" defaultValue={editingTut?.title} required />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea id="description" name="description" defaultValue={editingTut?.description} required />
                        </div>
                        <div>
                          <Label htmlFor="video_url">Video URL</Label>
                          <Input id="video_url" name="video_url" type="url" defaultValue={editingTut?.video_url} placeholder="YouTube or Vimeo URL" required />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Input id="category" name="category" defaultValue={editingTut?.category} placeholder="CPR, Choking, Burns, etc." required />
                        </div>
                        <div>
                          <Label htmlFor="thumbnail">Thumbnail URL</Label>
                          <Input id="thumbnail" name="thumbnail" type="url" defaultValue={editingTut?.thumbnail} />
                        </div>
                        <Button type="submit" className="w-full">
                          {editingTut ? "Update" : "Add"} Tutorial
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tutorials.map((tut) => (
                      <TableRow key={tut.id}>
                        <TableCell className="font-medium">{tut.title}</TableCell>
                        <TableCell>{tut.category}</TableCell>
                        <TableCell className="max-w-md truncate">{tut.description}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
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
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
