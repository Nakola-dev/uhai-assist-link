// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Assistant from "./pages/Assistant";
import ProfileView from "./pages/ProfileView";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import UserProfilePage from "./pages/UserProfilePage";
import UserQRPage from "./pages/UserQRPage";

// Layout (ONLY for public pages)
import Layout from "@/components/Layout";

const queryClient = new QueryClient();

// ────── Protected Route ──────
const ProtectedRoute = ({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode; 
  requiredRole?: "admin" | "user" 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAuthenticated(false);
        return;
      }
      setIsAuthenticated(true);
      if (requiredRole) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();
        setHasAccess(profile?.role === requiredRole);
      } else {
        setHasAccess(true);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session) {
          setIsAuthenticated(false);
          setHasAccess(false);
        } else {
          setIsAuthenticated(true);
          if (requiredRole) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", session.user.id)
              .maybeSingle();
            setHasAccess(profile?.role === requiredRole);
          } else {
            setHasAccess(true);
          }
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [requiredRole]);

  if (isAuthenticated === null || hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (requiredRole && !hasAccess) return <Navigate to="/dashboard/user" replace />;

  return <>{children}</>;
};

// ────── Main App ──────
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>

          {/* PUBLIC PAGES — FULL MARKETING LAYOUT */}
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

          {/* AUTH & PROFILE — HEADER ONLY */}
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

          {/* ERROR — NO LAYOUT */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />

          {/* FULL-SCREEN — NO LAYOUT */}
          <Route path="/assistant" element={<Assistant />} />

          {/* REDIRECTS */}
          <Route path="/dashboard" element={<Navigate to="/dashboard/user" replace />} />
          <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />

          {/* USER DASHBOARD — NO LAYOUT (HAS OWN HEADER) */}
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

          {/* ADMIN DASHBOARD — NO LAYOUT */}
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