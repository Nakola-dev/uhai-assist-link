import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle, QrCode, Phone, Heart } from "lucide-react";

interface HeroSlide {
  id: number;
  headline: string;
  subtext: string;
  primaryCTA: {
    text: string;
    path: string;
    icon: React.ReactNode;
  };
  secondaryCTA: {
    text: string;
    path: string;
  };
  imageAlt: string;
}

const slides: HeroSlide[] = [            /* INITIAL SLIDER */
  {
    id: 1,
    headline: "Instant AI Emergency Help — When Every Second Counts",
    subtext: "Get step-by-step first aid guidance powered by AI — anywhere in Kenya.",
    primaryCTA: {
      text: "Get Help Now",
      path: "/emergency-chat",
      icon: <AlertCircle className="h-5 w-5 animate-pulse" />,
    },
    secondaryCTA: {
      text: "Learn First Aid",                /* MAKE VISIBLE BEFORE HOVER EFFECT */
      path: "/about",
    },
    imageAlt: "First responder assisting patient",
  },
  {
    id: 2,
    headline: "Scan Medical QR for Faster Rescue",
    subtext: "Access vital patient info instantly — allergies, conditions & emergency contacts.",
    primaryCTA: {
      text: "Scan QR Code",
      path: "/dashboard",
      icon: <QrCode className="h-5 w-5" />,
    },
    secondaryCTA: {
      text: "How It Works",
      path: "/about",
    },
    imageAlt: "Medical QR wristband being scanned",
  },
];

export const HeroSlider = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsTransitioning(false);
      }, 300);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    if (index !== currentSlide) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const slide = slides[currentSlide];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-glow to-accent min-h-[85vh] flex items-center">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/10"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div
            className={`transition-all duration-300 ${
              isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            }`}
          >
            <div className="text-center text-white">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <Heart className="h-5 w-5 text-white animate-pulse" />
                <span className="font-semibold text-sm md:text-base">
                  AI Emergency Response System
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
                {slide.headline}
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl mb-10 text-white/95 max-w-3xl mx-auto leading-relaxed font-medium">
                {slide.subtext}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button
                  size="lg"
                  onClick={() => navigate(slide.primaryCTA.path)}
                  className="bg-white text-primary hover:bg-white/95 text-base md:text-lg px-8 py-6 md:px-10 md:py-7 shadow-emergency hover:shadow-xl transition-all duration-300 font-bold min-w-[200px] group"
                  aria-label={slide.primaryCTA.text}
                >
                  <span className="flex items-center gap-2">
                    {slide.primaryCTA.icon}
                    {slide.primaryCTA.text}
                    <span className="text-xl group-hover:scale-110 transition-transform">
                      🚨
                    </span>
                  </span>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate(slide.secondaryCTA.path)}
                  className="border-2 border-white text-white hover:bg-white/20 hover:border-white text-base md:text-lg px-8 py-6 md:px-10 md:py-7 backdrop-blur-sm transition-all duration-300 font-semibold min-w-[200px]"
                  aria-label={slide.secondaryCTA.text}
                >
                  {slide.secondaryCTA.text}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-3">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      currentSlide === index
                        ? "w-8 h-3 bg-white"
                        : "w-3 h-3 bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={currentSlide === index}
                  />
                ))}
              </div>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                <span className="text-sm md:text-base font-medium">24/7 Emergency Line</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                <span className="text-sm md:text-base font-medium">Instant Medical Access</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                <span className="text-sm md:text-base font-medium">Save Lives with AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/20 to-transparent pointer-events-none"></div>
    </section>
  );
};
