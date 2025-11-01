// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Pages
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

// Layout
import Layout from "@/components/Layout";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: "admin" | "user" }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsAuthenticated(false); return; }
      setIsAuthenticated(true);

      if (requiredRole) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).maybeSingle();
        setHasAccess(profile?.role === requiredRole);
      } else {
        setHasAccess(true);
      }
    };
    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      setIsAuthenticated(!!session);
      if (session && requiredRole) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).maybeSingle();
        setHasAccess(profile?.role === requiredRole);
      }
    });
    return () => subscription.unsubscribe();
  }, [requiredRole]);

  if (isAuthenticated === null || hasAccess === null) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (requiredRole && !hasAccess) return <Navigate to={requiredRole === "admin" ? "/dashboard/user" : "/dashboard/admin"} replace />;

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile/:token" element={<ProfileView />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>

          <Route path="/assistant" element={<Assistant />} />

          <Route path="/dashboard" element={<Navigate to="/dashboard/user" replace />} />
          <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />

          <Route path="/dashboard/user" element={<ProtectedRoute requiredRole="user"><Outlet /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<UserProfilePage />} />
            <Route path="qr" element={<UserQRPage />} />
          </Route>

          <Route path="/dashboard/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;