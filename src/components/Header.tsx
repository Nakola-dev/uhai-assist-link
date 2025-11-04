// src/components/Header.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Activity, Shield, LogOut, Menu, User, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();
        setIsAdmin(data?.role === "admin");
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          setUser(session.user);
          const { data } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle();
          setIsAdmin(data?.role === "admin");
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ variant: "destructive", title: "Sign out failed" });
    } else {
      toast({ title: "Signed out" });
      navigate("/auth");
    }
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard/user", icon: Activity, show: !!user },
    { label: "Admin Panel", path: "/dashboard/admin", icon: Shield, show: isAdmin },
    { label: "Profile", path: "/dashboard/user/profile", icon: User, show: !!user },
    { label: "QR Code", path: "/dashboard/user/qr", icon: Activity, show: !!user },
  ].filter(item => item.show);

  return (
    <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-lg hidden sm:block">UhaiLink</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className="flex items-center gap-2"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>

        {/* User Menu (Desktop) */}
        <div className="hidden md:block">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.email?.[0].toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard/user/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/dashboard/admin")}>
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <div className="flex flex-col gap-4 mt-8">
              {user && (
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{user.email}</p>
                    <p className="text-xs text-muted-foreground">{isAdmin ? "Admin" : "User"}</p>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      navigate(item.path);
                      setOpen(false);
                    }}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
              </nav>

              <div className="border-t pt-4 mt-4">
                {user ? (
                  <Button variant="destructive" className="w-full" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                ) : (
                  <Button className="w-full" onClick={() => navigate("/auth")}>
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;