// src/components/Header.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Activity, Menu, AlertCircle, ChevronDown, LogOut, Shield } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  // ────── Scroll Effect ──────
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ────── Auth & Role Check ──────
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();
        setIsAdmin(profile?.role === "admin");
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setIsAuthenticated(!!session);
        if (session) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle();
          setIsAdmin(profile?.role === "admin");
        } else {
          setIsAdmin(false);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  // ────── Sign Out ──────
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out", description: "See you soon!" });
    navigate("/");
  };

  // ────── ONLY SHOW ON PUBLIC PAGES ──────
  const publicPaths = ["/", "/about", "/contact", "/auth", "/profile/"];
  const isPublicPage = publicPaths.some(path => 
    path.endsWith("/") 
      ? location.pathname.startsWith(path) 
      : location.pathname === path
  );

  // DO NOT RENDER ON DASHBOARD, ASSISTANT, 404
  const blockedPaths = ["/dashboard", "/assistant", "/404"];
  const isBlocked = blockedPaths.some(path => location.pathname.startsWith(path));

  if (!isPublicPage || isBlocked) return null;

  // ────── Navigation ──────
  const navItems = [
    { label: "Home", path: "/" },
    { label: "Emergency Help", path: "/assistant" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        isScrolled
          ? "bg-background/98 backdrop-blur-lg shadow-md"
          : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity"
          >
            <Activity className="h-6 w-6 text-primary" />
            <span>UhaiLink</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth + CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Button
                    onClick={() => navigate("/dashboard/admin")}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Shield className="h-4 w-4" /> Admin
                  </Button>
                )}
                <Button
                  onClick={() => navigate("/dashboard/user")}
                  variant="outline"
                  size="sm"
                >
                  Dashboard
                </Button>
                <Button 
                  onClick={handleSignOut} 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      Sign In <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate("/auth")} className="cursor-pointer">
                      Login
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/auth?signup=true")} className="cursor-pointer">
                      Register
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  onClick={() => navigate("/auth?signup=true")}
                  size="sm"
                  className="bg-secondary hover:bg-secondary/90 animate-pulse"
                >
                  Create Free Account
                </Button>
              </>
            )}
            <Button
              onClick={() => navigate("/assistant")}
              size="sm"
              className="bg-destructive hover:bg-destructive/90 text-white font-semibold shadow-emergency"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              Get Help Now
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t pt-6 space-y-3">
                  {isAuthenticated ? (
                    <>
                      {isAdmin && (
                        <Button
                          onClick={() => { setIsOpen(false); navigate("/dashboard/admin"); }}
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <Shield className="h-4 w-4 mr-2" /> Admin Dashboard
                        </Button>
                      )}
                      <Button
                        onClick={() => { setIsOpen(false); navigate("/dashboard/user"); }}
                        variant="outline"
                        className="w-full"
                      >
                        User Dashboard
                      </Button>
                      <Button
                        onClick={() => { setIsOpen(false); handleSignOut(); }}
                        variant="ghost"
                        className="w-full flex items-center justify-start gap-2"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => { setIsOpen(false); navigate("/auth"); }}
                        variant="outline"
                        className="w-full"
                      >
                        Sign In
                      </Button>
                      <Button
                        onClick={() => { setIsOpen(false); navigate("/auth?signup=true"); }}
                        className="w-full bg-secondary hover:bg-secondary/90"
                      >
                        Create Free Account
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => { setIsOpen(false); navigate("/assistant"); }}
                    className="w-full bg-destructive hover:bg-destructive/90 text-white font-semibold"
                  >
                    <AlertCircle className="h-5 w-5 mr-2" /> Get Help Now
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

        </div>
      </div>
    </header>
  );
};

export default Header;