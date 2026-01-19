import { Suspense, lazy } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection"; // Eager load (Critical for LCP)
import { Footer } from "@/components/landing/Footer";
import { SEO } from "@/components/SEO";

// --- LAZY LOAD HEAVY SECTIONS ---
// This splits the code so the user only downloads what they need initially.
const StatsShowcase = lazy(() => import("@/components/landing/StatsShowcase").then(module => ({ default: module.StatsShowcase })));
const FeaturesShowcase = lazy(() => import("@/components/landing/FeaturesShowcase").then(module => ({ default: module.FeaturesShowcase })));
const ProductShowcase = lazy(() => import("@/components/landing/ProductShowcase").then(module => ({ default: module.ProductShowcase })));
const AIFeatureSection = lazy(() => import("@/components/landing/AIFeatureSection").then(module => ({ default: module.AIFeatureSection })));
const SmartImportSection = lazy(() => import("@/components/landing/SmartImportSection").then(module => ({ default: module.SmartImportSection })));
const TradingPersonas = lazy(() => import("@/components/landing/TradingPersonas").then(module => ({ default: module.TradingPersonas })));
const HowItWorks = lazy(() => import("@/components/landing/HowItWorks").then(module => ({ default: module.HowItWorks }))); // Optional, keep if you have it
const Pricing = lazy(() => import("@/components/landing/Pricing").then(module => ({ default: module.Pricing })));
const FAQ = lazy(() => import("@/components/landing/FAQ").then(module => ({ default: module.FAQ })));
const CTA = lazy(() => import("@/components/landing/CTA").then(module => ({ default: module.CTA })));

// ✅ Define Flag to control feature visibility
const SHOW_DEV_FEATURES = import.meta.env.DEV;

// Loading Fallback (Prevents layout shift while components load)
const SectionLoader = () => <div className="w-full h-96 animate-pulse bg-background/50" />;

const Index = () => {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary font-sans">
      
      {/* 1. SEO & METADATA */}
      <SEO 
        title="AI-Powered Trading Journal & Analytics"
        description="Master your trading psychology with TradeOmen. The advanced AI trading journal that analyzes your behavior, identifies patterns, and helps you become profitable."
        keywords={[
          "trading journal", 
          "AI trading analytics", 
          "crypto journal", 
          "forex tracker", 
          "trading psychology", 
          "automated trade import"
        ]}
        canonical="https://tradeomen.com/"
      />

      <Navbar />
      
      {/* 2. HERO SECTION (Loaded Instantly) */}
      <HeroSection />
      
      {/* 3. LAZY LOADED SECTIONS */}
      <Suspense fallback={<SectionLoader />}>
        
        {/* The "Glass HUD" Stats */}
        <StatsShowcase />
        
        {/* Feature Grid */}
        <FeaturesShowcase />
        
        {/* The "Product Tour" (Tabs & 3D Browser) */}
        <ProductShowcase />
        
        {/* ✅ AI Section: Hidden in Production (Free Beta Mode) */}
        {SHOW_DEV_FEATURES && <AIFeatureSection />}

        {/* Data Funnel / Import Section */}
        <SmartImportSection />
        
        {/* Process Steps (Optional if you kept this file) */}
        {/* <HowItWorks /> */}
        
        {/* "Who is this for?" (Replaces Testimonials) */}
        <TradingPersonas />
        
        {/* ✅ Pricing: Hidden in Production (Free Beta Mode) */}
        {SHOW_DEV_FEATURES && <Pricing />}
        
        {/* ✅ FAQ: Hidden in Production (Usually contains pricing info) */}
        {SHOW_DEV_FEATURES && <FAQ />}
        
        {/* "Stop Guessing" Finale */}
        <CTA />
        
      </Suspense>
      
      <Footer />
    </main>
  );
};

export default Index;