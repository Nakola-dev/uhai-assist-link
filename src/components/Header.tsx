// src/components/Header.tsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import {
  Activity,
  Shield,
  LogOut,
  Menu,
  User,
  MessageCircle,
  Info,
  Home,
  Bot,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PUBLIC_ROUTES = ["/", "/about", "/contact", "/assistant", "/auth"];
const DASHBOARD_PREFIX = "/dashboard";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPublic = PUBLIC_ROUTES.includes(location.pathname) ||
    location.pathname.startsWith("/profile/");

  const isDashboard = location.pathname.startsWith(DASHBOARD_PREFIX);

  /* ──────── AUTH & ROLE ──────── */
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        await loadRole(session.user.id);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          setUser(session.user);
          await loadRole(session.user.id);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const loadRole = async (uid: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", uid)
      .maybeSingle();
    setIsAdmin(data?.role === "admin");
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ variant: "destructive", title: "Sign out failed" });
    } else {
      toast({ title: "Signed out" });
      navigate("/auth");
    }
  };

  /* ──────── PUBLIC NAV ──────── */
  const publicLinks = [
    { label: "Home", path: "/", icon: Home },
    { label: "Assistant", path: "/assistant", icon: Bot },
    { label: "Contact Us", path: "/contact", icon: MessageCircle },
    { label: "About Us", path: "/about", icon: Info },
  ];

  /* ──────── DASHBOARD NAV (sidebar) ──────── */
  const dashboardLinks = [
    { label: "Dashboard", path: "/dashboard/user", icon: Activity, show: true },
    { label: "Profile", path: "/dashboard/user/profile", icon: User, show: true },
    { label: "QR Code", path: "/dashboard/user/qr", icon: Activity, show: true },
    { label: "Admin Panel", path: "/dashboard/admin", icon: Shield, show: isAdmin },
  ].filter(i => i.show);

  /* ──────── RENDER ──────── */
  return (
    <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">

        {/* ── LOGO ── */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-lg hidden sm:block">UhaiLink</span>
        </div>

        {/* ── PUBLIC NAV (desktop) ── */}
        {isPublic && !isDashboard && (
          <nav className="hidden md:flex items-center gap-4">
            {publicLinks.map((l) => (
              <Button
                key={l.path}
                variant={location.pathname === l.path ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(l.path)}
                className="flex items-center gap-2"
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </Button>
            ))}
          </nav>
        )}

        {/* ── DASHBOARD SIDEBAR (desktop) ── */}
        {isDashboard && (
          <nav className="hidden md:flex items-center gap-2">
            {dashboardLinks.map((l) => (
              <Button
                key={l.path}
                variant={location.pathname.startsWith(l.path) ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(l.path)}
                className="flex items-center gap-2"
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </Button>
            ))}
          </nav>
        )}

        {/* ── USER MENU / SIGN IN (desktop) ── */}
        <div className="hidden md:flex items-center gap-2">
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

        {/* ── MOBILE MENU ── */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-64">
            <div className="flex flex-col gap-4 mt-8">

              {/* User info */}
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

              {/* PUBLIC LINKS */}
              {isPublic && !isDashboard && (
                <nav className="flex flex-col gap-1">
                  {publicLinks.map((l) => (
                    <Button
                      key={l.path}
                      variant={location.pathname === l.path ? "default" : "ghost"}
                      className="justify-start"
                      onClick={() => {
                        navigate(l.path);
                        setMobileOpen(false);
                      }}
                    >
                      <l.icon className="h-4 w-4 mr-2" />
                      {l.label}
                    </Button>
                  ))}
                </nav>
              )}

              {/* DASHBOARD LINKS */}
              {isDashboard && (
                <nav className="flex flex-col gap-1">
                  {dashboardLinks.map((l) => (
                    <Button
                      key={l.path}
                      variant={location.pathname.startsWith(l.path) ? "default" : "ghost"}
                      className="justify-start"
                      onClick={() => {
                        navigate(l.path);
                        setMobileOpen(false);
                      }}
                    >
                      <l.icon className="h-4 w-4 mr-2" />
                      {l.label}
                    </Button>
                  ))}
                </nav>
              )}

              {/* AUTH ACTIONS */}
              <div className="border-t pt-4 mt-4">
                {user ? (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      handleSignOut();
                      setMobileOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => {
                      navigate("/auth");
                      setMobileOpen(false);
                    }}
                  >
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