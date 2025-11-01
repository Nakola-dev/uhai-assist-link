// src/components/Layout.tsx
import { useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  const { pathname } = useLocation();

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  // Public routes that should show Header + Footer
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/profile/") ||
    pathname === "/404";

  // Dashboard & Assistant never show marketing layout
  const isDashboardOrAssistant =
    pathname.startsWith("/dashboard") || pathname.startsWith("/assistant");

  // Auth / error pages – full-screen, no layout
  const isAuthOrError =
    pathname.startsWith("/auth") || pathname === "/404";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Marketing Header (only on public pages) */}
      {isPublicRoute && !isDashboardOrAssistant && <Header />}

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Marketing Footer (only on public pages) */}
      {isPublicRoute && !isDashboardOrAssistant && !isAuthOrError && <Footer />}
    </div>
  );
};

export default Layout;