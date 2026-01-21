import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar"; // Ensure this path matches your project structure
import { Footer } from "@/components/Footer"; // Ensure this path matches your project structure
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
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center relative w-full py-20 md:py-32 overflow-hidden">
        {/* Static Background Grid for Professional 'Data' Feel */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{
               backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
               backgroundSize: '40px 40px'
             }} 
        />
        
        {/* Ambient Glow - Static & Subtle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 container max-w-4xl px-6 flex flex-col items-center text-center">
          
          {/* Main 404 Typography */}
          <h1 className="text-[9rem] sm:text-[12rem] font-bold leading-none tracking-tighter text-gradient-primary select-none opacity-90">
            404
          </h1>

          {/* Sub-headline */}
          <h2 className="mt-6 text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Page not found
          </h2>
          
          {/* Description */}
          <p className="mt-5 text-lg text-muted-foreground max-w-[540px] leading-relaxed">
            The page you are looking for doesn't exist or has been moved. 
            Check the URL or return to the dashboard to continue your analysis.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button 
              onClick={() => navigate("/")}
              className="glow-button h-12 px-8 min-w-[180px] rounded-full text-base font-medium transition-transform hover:translate-y-[-1px]"
            >
              <House className="mr-2 h-5 w-5" weight="bold" />
              Return Home
            </Button>

            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="h-12 px-8 min-w-[180px] rounded-full border-border/60 bg-background/50 backdrop-blur-sm text-base font-medium hover:bg-muted transition-colors"
            >
              <ArrowLeft className="mr-2 h-5 w-5" weight="regular" />
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