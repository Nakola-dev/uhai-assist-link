// src/components/Layout.tsx
import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

const Layout = ({ children, showHeader = true, showFooter = true }: LayoutProps) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);



export default Layout;