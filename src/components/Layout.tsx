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

  // ONLY show header/footer on these public pages
  const publicPaths = ["/", "/about", "/contact"];
  const isPublicPage = publicPaths.includes(pathname);

  // If not public → render content only (Dashboard, Assistant, Auth, etc.)
  if (!isPublicPage) {
    return <Outlet />;
  }

  // Public page → full marketing layout
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;