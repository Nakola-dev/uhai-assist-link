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

  // Prevent double-redirect from onAuthStateChange
  const isRedirecting = useRef(false);

  // ------------------------------------------------------------------ //
  // 1. Initial session check (if already logged in → go to dashboard)
  // ------------------------------------------------------------------ //
  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) await redirectToDashboard(data.session.user.id);
    };
    check();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session) return;
        if (event === "SIGNED_IN" && !isRedirecting.current) {
          await redirectToDashboard(session.user.id);
        }
      }
    );
    return () => authListener.subscription.unsubscribe();
  }, [navigate]);

  // ------------------------------------------------------------------ //
  // 2. Helper – fetch role + navigate (only once)
  // ------------------------------------------------------------------ //
  const redirectToDashboard = async (userId: string) => {
    if (isRedirecting.current) return;
    isRedirecting.current = true;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    const role = profile?.role ?? "user"; // fallback if profile missing
    navigate(role === "admin" ? "/dashboard/admin" : "/dashboard/user", {
      replace: true,
    });
  };

  // ------------------------------------------------------------------ //
  // 3. Switch to signup mode when URL contains ?signup
  // ------------------------------------------------------------------ //
  useEffect(() => {
    if (location.search.includes("signup")) setIsLogin(false);
  }, [location]);

  // ------------------------------------------------------------------ //
  // 4. Auth handler (login OR signup)
  // ------------------------------------------------------------------ //
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // ---------- LOGIN ----------
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // redirect is handled by onAuthStateChange
        toast({ title: "Welcome back!" });
      } else {
        // ---------- SIGNUP ----------
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, phone } },
        });
        if (error) throw error;

        // 1. Create profile row **immediately**
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user!.id,
            full_name: fullName,
            phone,
            role: "user", // <-- default role
          });

        if (profileError) {
          console.error("Profile creation failed:", profileError);
          toast({
            variant: "destructive",
            title: "Profile error",
            description: "Account created but profile failed. Contact support.",
          });
        } else {
          toast({ title: "Account created!" });
        }

        // redirect is handled by onAuthStateChange
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------ //
  // 5. UI (unchanged except button text)
  // ------------------------------------------------------------------ //
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
            {/* ---- SIGNUP ONLY FIELDS ---- */}
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

            {/* ---- EMAIL ---- */}
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

            {/* ---- PASSWORD ---- */}
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