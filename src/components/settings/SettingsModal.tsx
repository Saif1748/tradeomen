import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  User, PaintBrush, ChartLine, Robot, Bell, ShieldCheck, Plugs, CreditCard, X
} from "@phosphor-icons/react";

// Import Sections
import { ProfileSection } from "./sections/ProfileSection";
import { AppearanceSection } from "./sections/AppearanceSection";
import { TradingSection } from "./sections/TradingSection";
import { 
  AISection, 
  NotificationsSection, 
  PrivacySection, 
  IntegrationsSection, 
  SubscriptionSection 
} from "./sections/GeneralSections";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsSection = 
  | "profile" 
  | "appearance" 
  | "trading" 
  | "ai" 
  | "notifications" 
  | "privacy" 
  | "integrations" 
  | "subscription";

const sections: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: PaintBrush },
  { id: "trading", label: "Trading Preferences", icon: ChartLine },
  { id: "ai", label: "AI Assistant", icon: Robot },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Data & Privacy", icon: ShieldCheck },
  { id: "integrations", label: "Integrations", icon: Plugs },
  { id: "subscription", label: "Subscription", icon: CreditCard },
];

const sectionComponents: Record<SettingsSection, React.FC> = {
  profile: ProfileSection,
  appearance: AppearanceSection,
  trading: TradingSection,
  ai: AISection,
  notifications: NotificationsSection,
  privacy: PrivacySection,
  integrations: IntegrationsSection,
  subscription: SubscriptionSection,
};

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const isMobile = useIsMobile();

  // ✅ Filter sections based on Environment
  const visibleSections = sections.filter((section) => {
    // Show all sections in Development (Localhost)
    if (import.meta.env.DEV) return true;

    // In Production, only show: Profile, Trading, and Privacy
    return ["profile", "trading", "privacy"].includes(section.id);
  });

  const ActiveComponent = sectionComponents[activeSection];

  const content = (
    <div className="flex flex-col sm:flex-row h-full sm:h-[70vh] max-h-[85vh]">
      {/* Sidebar Navigation */}
      <div className="sm:w-56 sm:border-r border-border/50 sm:pr-4 pb-4 sm:pb-0 overflow-x-auto sm:overflow-x-visible">
        <div className="flex sm:flex-col gap-1 sm:gap-1 min-w-max sm:min-w-0">
          {visibleSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all whitespace-nowrap",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <Icon weight={isActive ? "fill" : "regular"} className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 sm:pl-6 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-medium text-foreground mb-6">
              {sections.find((s) => s.id === activeSection)?.label}
            </h3>
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-6">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center justify-between">
              <span>Settings</span>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary/50">
                <X weight="bold" className="w-5 h-5" />
              </button>
            </SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-6">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;