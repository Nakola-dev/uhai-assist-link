// src/components/Layout.tsx
import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

/**
 * Global Layout Wrapper
 * - Ensures consistent header/footer across pages
 * - Responsive, mobile-first
 * - RLS-safe (no data fetching here)
 * - Used in App.tsx via <Outlet />
 */
const Layout = ({ children, showHeader = true, showFooter = true }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-secondary-light/5 to-accent-light/5">
      {/* Header */}
      {showHeader && <Header />}

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;