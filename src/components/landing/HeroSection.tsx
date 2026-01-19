import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Lightning, Play } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { BrowserFrame } from "./BrowserFrame";

// Standard fade-in animation
const fadeInUp = {
  initial: { opacity: 0, y: 30, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function HeroSection() {
  // --- Setup for 3D Mouse Follow Effect ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the mouse movement
  const mouseX = useSpring(x, { stiffness: 50, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 50, damping: 20 });

  // Calculate rotation based on mouse position relative to the center of the screen
  const rotateX = useTransform(mouseY, (value) => (value - window.innerHeight / 2) / 70);
  const rotateY = useTransform(mouseX, (value) => (value - window.innerWidth / 2) / -70);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    x.set(event.clientX);
    y.set(event.clientY);
  }
  // ----------------------------------------

  // ✅ Dynamic Content based on Environment
  const isDev = import.meta.env.DEV;

  const badgeText = isDev 
    ? "AI-Powered Trading Journal" 
    : "Early Access Beta: 100% Free";

  const ctaText = isDev 
    ? "Start Free Trial" 
    : "Start Trading for Free";

  const subText = isDev 
    ? "TradeOmen helps traders journal, analyze, and improve their performance with AI-powered insights. Track every trade, discover your patterns, and make smarter decisions."
    : "TradeOmen helps traders journal, analyze, and improve their performance. Join the beta today to track every trade, discover patterns, and make smarter decisions—completely free.";

  return (
    <section 
      className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden"
      onMouseMove={handleMouseMove} // Attach mouse listener to section
    >
      {/* Background Effects */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 mesh-gradient" />
      
      {/* Floating Background Orbs... */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
           <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.7, delay: 0, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 bg-primary/10 mb-8"
          >
            <Lightning size={16} weight="fill" className="text-primary" />
            <span className="text-sm font-medium text-primary tracking-wide">
              {badgeText}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-4xl sm:text-5xl lg:text-7xl font-light tracking-tight-premium leading-hero"
          >
            Your Trading Edge{" "}
            <span className="font-medium text-gradient-primary block sm:inline">
              Starts Here
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-8 text-lg sm:text-xl font-light text-muted-foreground tracking-normal-premium leading-body max-w-2xl mx-auto"
          >
            {subText}
          </motion.p>

           {/* CTAs */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 lg:mb-28"
          >
            <Link 
              to="/dashboard"
              className="glow-button px-8 py-4 rounded-full text-base font-medium text-primary-foreground inline-flex items-center gap-2 group"
            >
              {ctaText}
              <ArrowRight 
                size={18} 
                weight="bold" 
                className="transition-transform group-hover:translate-x-1" 
              />
            </Link>
          </motion.div>
        </div>

        {/* === THE NEW PROFESSIONAL HERO SHOT === */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.9, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          // Add perspective to the container
          style={{ perspective: "1200px" }} 
          className="relative"
        >
          {/* 1. The ambient glow BEHIND the screenshot to make it pop */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[60%] bg-primary/30 blur-[150px] -z-10 rounded-full" />

          {/* 2. The 3D Tilted Browser Frame */}
          <motion.div
            style={{ 
              rotateX, 
              rotateY,
              // Default slight tilt so it looks 3D even without mouse movement
              transformStyle: "preserve-3d",
            }}
            initial={{ rotateX: 15 }} // Start with a noticeable tilt up
            animate={{ rotateX: 5 }} // Settle into a subtle tilt
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            className="mx-auto max-w-6xl"
          >
             {/* Using our improved BrowserFrame with interactive prop true */}
            <BrowserFrame interactive className="shadow-[0_30px_60px_-10px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.1)]">
              <img 
                src="/images/dashboard.webp" 
                alt="TradeOmen Dashboard"
                className="w-full h-auto object-cover"
                loading="eager"
              />
            </BrowserFrame>
          </motion.div>

          {/* Floating badges - Now also affected by the 3D tilt for realism */}
          <motion.div
             style={{ rotateX, rotateY, z: 50 }} // z: 50 makes it float "above" the dashboard
             className="absolute -left-4 top-1/4 hidden lg:block z-20"
          >
            <div className="glass-card px-4 py-3 flex items-center gap-3 border border-border/50 shadow-xl backdrop-blur-md bg-background/60">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-emerald-400 font-semibold">↑</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Win Rate</p>
                <p className="text-xs text-muted-foreground">+23% improvement</p>
              </div>
            </div>
          </motion.div>
          {/* ... Right floating badge (apply similar style & z index) ... */}
        </motion.div>
      </div>
    </section>
  );
}