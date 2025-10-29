import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Activity, Menu, X, AlertCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Emergency Help", path: "/emergency-chat" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
            <Activity className="h-6 w-6 text-primary" />
            <span>UhaiLink</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button - Desktop */}
          <Button
            onClick={() => navigate("/emergency-chat")}
            className="hidden md:flex items-center gap-2 bg-primary hover:bg-primary/90"
            size="lg"
          >
            <AlertCircle className="h-5 w-5" />
            Get Help Now 🚨
          </Button>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/emergency-chat");
                  }}
                  className="w-full items-center gap-2 bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  <AlertCircle className="h-5 w-5" />
                  Get Help Now 🚨
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
