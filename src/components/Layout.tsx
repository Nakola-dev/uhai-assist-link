// src/components/Layout.tsx
import { useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  const { pathname } = useLocation();

  // Scroll to top on every navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  // Define which routes are "public" (marketing layout)
  const publicRoutes = [
    "/",
    "/about",
    "/contact",
  ];

  const isPublicPage = publicRoutes.includes(pathname) || pathname === "/";

  // These routes NEVER show header/footer
  const noLayoutRoutes = [
    "/auth",
    "/assistant",
    "/404",
  ];

  const hasNoLayout = noLayoutRoutes.some(route => pathname.startsWith(route));

  // Profile view: clean emergency view (no header/footer)
  const isProfileView = pathname.startsWith("/profile/");

  // Dashboard: user or admin
  const isDashboard = pathname.startsWith("/dashboard");

  // Final decision
  const showHeader = isPublicPage && !hasNoLayout && !isProfileView && !isDashboard;
  const showFooter = isPublicPage && !hasNoLayout && !isProfileView && !isDashboard;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Marketing Header */}
      {showHeader && <Header />}

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Marketing Footer */}
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;