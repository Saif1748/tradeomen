import React from "react";
import { Lock } from "lucide-react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useModal } from "@/contexts/ModalContext";
import { cn } from "@/lib/utils";

interface FeatureGateProps {
  /** The specific permission flag from useFeatureAccess */
  feature: "canExport" | "canSyncBrokers" | "canWebSearch" | "isPro" | "isPremium";
  children: React.ReactNode;
  /** Optional: custom message for the lock tooltip */
  label?: string;
  /** Optional: bypass the blur effect and just hide the element */
  hideOnly?: boolean;
  className?: string;
}

/**
 * FeatureGate
 * Intercepts interactions with locked features and triggers the UpgradeModal.
 * Designed to match the professional TradeOmen landing page aesthetic.
 */
export const FeatureGate = ({ 
  feature, 
  children, 
  label = "Upgrade to Unlock", 
  hideOnly = false,
  className 
}: FeatureGateProps) => {
  const access = useFeatureAccess();
  const { setUpgradeModalOpen } = useModal();
  
  const hasAccess = access[feature];

  if (hasAccess) {
    return <>{children}</>;
  }

  // If the developer wants to completely hide the feature for certain tiers
  if (hideOnly) {
    return null;
  }

  return (
    <div 
      className={cn("relative group cursor-default overflow-hidden rounded-xl", className)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setUpgradeModalOpen(true);
      }}
    >
      {/* Visual Gate: Blur effect consistent with Landing Page Hero/Stats */}
      <div className="filter blur-[2px] grayscale opacity-40 pointer-events-none select-none transition-all duration-300 group-hover:blur-[3px]">
        {children}
      </div>

      {/* Lock Overlay: Professional SaaS centered badge */}
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/10 backdrop-blur-[1px] transition-opacity duration-300">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/90 border border-border shadow-xl transform transition-transform duration-300 group-hover:scale-105">
          <Lock className="w-3.5 h-3.5 text-primary fill-primary/10" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">
            {label}
          </span>
        </div>
      </div>

      {/* Subtle hover glow matching your PricingSection highlights */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-tr from-primary/5 via-transparent to-transparent" />
    </div>
  );
};