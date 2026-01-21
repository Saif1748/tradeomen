import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar"; // or "@/components/landing/Navbar" depending on your preference
import { Footer } from "@/components/Footer"; // or "@/components/landing/Footer"
import { ArrowLeft, House } from "@phosphor-icons/react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans selection:bg-primary/20 selection:text-primary">
      <Navbar />

      <main className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Background Effects matching your HeroSection */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full opacity-50" />
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
        </div>

        <div className="relative z-10 container px-4 md:px-6 flex flex-col items-center text-center animate-fade-in">
          {/* 404 Glitch/Gradient Effect */}
          <div className="relative">
            <h1 className="text-[10rem] md:text-[12rem] font-bold leading-none tracking-tighter text-gradient-primary select-none opacity-90 animate-float">
              404
            </h1>
            <div className="absolute inset-0 bg-background/10 backdrop-blur-[1px]" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Lost in the Markets?
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-[500px] mb-8 leading-relaxed">
            The page you are looking for doesn't exist or has been moved. 
            Let's get you back to your trading journal.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Primary Action - Uses your glow-button class */}
            <Button 
              onClick={() => navigate("/")}
              className="glow-button h-12 px-8 rounded-full text-base"
            >
              <House className="mr-2 h-5 w-5" weight="bold" />
              Return Home
            </Button>

            {/* Secondary Action - Uses glass/outline style */}
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="h-12 px-8 rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;