// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// ── Public pages ────────────────────────────────────────────────────────
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Assistant from "./pages/Assistant";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProfileView from "./pages/ProfileView";
import NotFound from "./pages/NotFound";

// ── Dashboard pages ─────────────────────────────────────────────────────
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserProfilePage from "./pages/UserProfilePage";
import UserQRPage from "./pages/UserQRPage";

// ── Layout ───────────────────────────────────────────────────────────────
import Layout from "@/components/Layout";

const queryClient = new QueryClient();

/* ──────────────────────── ProtectedRoute (RLS-safe) ──────────────────────── */
const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
}) => {
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated" | "no-access">("loading");

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus("unauthenticated");
        return;
      }

      if (!requiredRole) {
        setStatus("authenticated");
        return;
      }

      // RLS-safe: only fetch own profile
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Profile fetch error in ProtectedRoute:", error);
      }

      const role = profile?.role ?? "user";
      setStatus(role === requiredRole ? "authenticated" : "no-access");
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session) {
          setStatus("unauthenticated");
        } else if (requiredRole) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle();
          const role = profile?.role ?? "user";
          setStatus(role === requiredRole ? "authenticated" : "no-access");
        } else {
          setStatus("authenticated");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [requiredRole]);

  // ── UI States ──
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary-light/10 to-accent-light/10">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") return <Navigate to="/auth" replace />;
  if (status === "no-access") return <Navigate to="/dashboard/user" replace />;

  return <>{children}</>;
};

/* ──────────────────────────────── App Router ──────────────────────────────── */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>

          {/* ── PUBLIC PAGES: FULL MARKETING LAYOUT ── */}
          <Route
            element={
              <Layout showHeader={true} showFooter={true}>
                <Outlet />
              </Layout>
            }
          >
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* ── AUTH & PROFILE: HEADER ONLY ── */}
          <Route
            element={
              <Layout showHeader={true} showFooter={false}>
                <Outlet />
              </Layout>
            }
          >
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile/:token" element={<ProfileView />} />
          </Route>

          {/* ── ERROR & CATCH-ALL ── */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />

          {/* ── FULL-SCREEN PAGES ── */}
          <Route path="/assistant" element={<Assistant />} />

          {/* ── REDIRECTS ── */}
          <Route path="/dashboard" element={<Navigate to="/dashboard/user" replace />} />
          <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />

          {/* ── USER DASHBOARD ── */}
          <Route
            path="/dashboard/user"
            element={
              <ProtectedRoute requiredRole="user">
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<UserProfilePage />} />
            <Route path="qr" element={<UserQRPage />} />
          </Route>

          {/* ── ADMIN DASHBOARD ── */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;