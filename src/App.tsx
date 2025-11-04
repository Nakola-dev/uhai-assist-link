// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
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

// ── PAGES ───────────────────────────────────────────────────────
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Assistant from "./pages/Assistant";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProfileView from "./pages/ProfileView";
import NotFound from "./pages/NotFound";

import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserProfilePage from "./pages/UserProfilePage";
import UserQRPage from "./pages/UserQRPage";

// ── LAYOUT ───────────────────────────────────────────────────────
import Layout from "@/components/Layout";

const queryClient = new QueryClient();

/* ────────────────────── PROTECTED ROUTE (timeout-safe) ────────────────────── */
const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
}) => {
  const [status, setStatus] = useState<"loading" | "auth" | "no-auth" | "no-access">(
    "loading"
  );

  useEffect(() => {
    const check = async () => {
      try {
        const { data: { session } } = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, r) => setTimeout(() => r(new Error("session timeout")), 5000)),
        ]);

        if (!session) {
          setStatus("no-auth");
          return;
        }

        if (!requiredRole) {
          setStatus("auth");
          return;
        }

        const { data: profile } = await Promise.race([
          supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle(),
          new Promise((_, r) => setTimeout(() => r(new Error("role timeout")), 5000)),
        ]);

        const role = profile?.role ?? "user";
        setStatus(role === requiredRole ? "auth" : "no-access");
      } catch (e) {
        console.error("ProtectedRoute error:", e);
        setStatus("no-auth");
      }
    };

    check();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setStatus("no-auth");
      } else if (requiredRole) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();
        const role = profile?.role ?? "user";
        setStatus(role === requiredRole ? "auth" : "no-access");
      } else {
        setStatus("auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [requiredRole]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary-light/5 to-accent-light/5">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "no-auth") return <Navigate to="/auth" replace />;
  if (status === "no-access") return <Navigate to="/dashboard/user" replace />;

  return <>{children}</>;
};

/* ────────────────────── APP ROUTER ────────────────────── */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>

          {/* PUBLIC MARKETING PAGES */}
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

          {/* AUTH & PUBLIC PROFILE VIEW */}
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

          {/* FULL-SCREEN PAGES */}
          <Route path="/assistant" element={<Assistant />} />

          {/* REDIRECTS */}
          <Route path="/dashboard" element={<Navigate to="/dashboard/user" replace />} />
          <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />

          {/* USER DASHBOARD */}
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

          {/* ADMIN DASHBOARD */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;