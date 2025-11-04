// src/pages/Auth.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Activity, Mail, Lock, User, Phone, AlertCircle } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Prevent double-redirect
  const isRedirecting = useRef(false);
  const mounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  // Check session on mount + listen to auth changes
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session && mounted.current) {
        await redirectToDashboard(data.session.user.id);
      }
    };
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted.current) return;
        if (session && event === "SIGNED_IN" && !isRedirecting.current) {
          await redirectToDashboard(session.user.id);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  // Switch to signup if URL has ?signup
  useEffect(() => {
    if (location.search.includes("signup")) setIsLogin(false);
  }, [location]);

  // Redirect based on role from profiles.role
  const redirectToDashboard = async (userId: string) => {
    if (isRedirecting.current) return;
    isRedirecting.current = true;

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") { // Ignore "no rows" error
        console.error("Profile fetch error:", error);
        toast({
          variant: "destructive",
          title: "Profile Error",
          description: "Could not load user role. Defaulting to user.",
        });
      }

      const role = profile?.role ?? "user";
      console.log("Redirecting user:", userId, "Role:", role);

      navigate(role === "admin" ? "/dashboard/admin" : "/dashboard/user", {
        replace: true,
      });
    } catch (err: any) {
      console.error("Redirect failed:", err);
      toast({
        variant: "destructive",
        title: "Redirect Error",
        description: err.message || "Failed to redirect. Please try again.",
      });
      isRedirecting.current = false;
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        toast({ title: "Welcome back!" });
        // redirectToDashboard called via onAuthStateChange
      } else {
        // SIGNUP
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, phone } },
        });
        if (error) throw error;
        if (!data.user) throw new Error("User creation failed");

        // Insert profile immediately (trigger may also fire, but upsert is safe)
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            full_name: fullName,
            phone,
            email,
            role: "user",
          });

        if (profileError) {
          console.error("Profile insert failed (non-fatal):", profileError);
          // Don't block login — fallback to "user" role
        } else {
          console.log("Profile created for user:", data.user.id);
        }

        toast({ title: "Account created! Signing you in..." });
        await redirectToDashboard(data.user.id);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: err.message || "Please check your credentials and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent-light/5 to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-emergency border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-gradient-to-br from-primary to-accent shadow-emergency">
              <Activity className="h-10 w-10 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-foreground">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {isLogin
                ? "Sign in to access your emergency medical profile"
                : "Join UhaiLink to protect yourself and save lives"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleAuth} className="space-y-5">
            {/* SIGNUP FIELDS */}
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+254 712 345 678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
              </>
            )}

            {/* EMAIL */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-emergency"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? "Sign In" : "Create Free Account"}
                  <AlertCircle className="h-5 w-5" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {isLogin ? "Don't have an account?" : "Already registered?"}
                </span>
              </div>
            </div>

            <Button type="button" variant="outline" onClick={toggleMode} className="w-full h-11 font-semibold">
              {isLogin ? "Create Free Account" : "Sign In Instead"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;