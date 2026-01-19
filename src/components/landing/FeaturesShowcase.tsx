import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { 
  ChartLine, 
  Robot, 
  Target, 
  Calendar, 
  Export, 
  ShieldCheck,
  TrendUp,
  Tag
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: ChartLine,
    title: "Advanced Analytics",
    description: "Track 50+ metrics including win rate, profit factor, drawdown, R-multiples, and equity curves.",
    color: "text-emerald-400",
  },
  // ✅ 1. Hide AI in Production (Only visible in Dev)
  ...(import.meta.env.DEV ? [{
    icon: Robot,
    title: "AI Trade Analysis",
    description: "Get personalized insights and pattern recognition powered by machine learning algorithms.",
    color: "text-primary",
  }] : []),
  {
    icon: Target,
    title: "Strategy Management",
    description: "Create, track, and compare multiple trading strategies with detailed performance metrics.",
    color: "text-amber-400",
  },
  {
    icon: Calendar,
    title: "Visual Calendar",
    description: "View your trading activity on an intuitive calendar with daily P&L and trade counts.",
    color: "text-blue-400",
  },
  {
    icon: Tag,
    title: "Smart Tagging",
    description: "Organize trades with custom tags and discover which setups work best for you.",
    color: "text-pink-400",
  },
  // ✅ 2. Hide Reports in Production (Only visible in Dev)
  ...(import.meta.env.DEV ? [{
    icon: Export,
    title: "Export Reports",
    description: "Generate professional PDF and CSV reports to track your progress over time.",
    color: "text-purple-400",
  }] : []),
  {
    icon: TrendUp,
    title: "Performance Tracking",
    description: "Monitor your trading score, consistency, and risk management in real-time.",
    color: "text-cyan-400",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    description: "Bank-level encryption ensures your trading data stays safe and private.",
    color: "text-green-400",
  },
];

export function FeaturesShowcase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" ref={ref} className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 lg:mb-24"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase tracking-widest font-medium mb-6">
            Powerful Features
          </span>
          <h2 className="text-3xl lg:text-5xl font-light tracking-tight-premium leading-section mb-6">
            Everything You Need to{" "}
            <span className="font-medium text-gradient-primary">Trade Smarter</span>
          </h2>
          <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
            A complete toolkit designed to help you analyze, improve, and master your trading psychology.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <div className="card-glow group h-full p-6 rounded-2xl bg-card/20 backdrop-blur-sm border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:bg-card/30 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
                
                {/* Icon Container */}
                <div className={cn("w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-5 transition-transform group-hover:scale-105 group-hover:bg-white/10", feature.color)}>
                  <feature.icon size={24} weight="duotone" className="opacity-90" />
                </div>
                
                <h3 className="text-lg font-medium mb-3 tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-sm text-muted-foreground font-light leading-relaxed group-hover:text-muted-foreground/80">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}