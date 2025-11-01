// src/components/Layout.tsx
import { useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  // ONLY public marketing pages
  const publicPages = ["/", "/about", "/contact"];
  const isPublic = publicPages.includes(pathname);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {isPublic && <Header />}
      <main className="flex-1"><Outlet /></main>
      {isPublic && <Footer />}
    </div>
  );
};

export default Layout;