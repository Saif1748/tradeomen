import React, { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { UpgradeModal } from "@/components/modals/UpgradeModal";

/**
 * ModalContext Interface
 * Centralizes management for high-conversion application events.
 */
interface ModalContextType {
  isUpgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
  triggerUpgrade: (message?: string) => void;
  closeAllModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [contextualMessage, setContextualMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * triggerUpgrade
   * Can be called by FeatureGate or any restricted action to prompt a plan change.
   */
  const triggerUpgrade = (msg?: string) => {
    if (msg) setContextualMessage(msg);
    setUpgradeModalOpen(true);
  };

  const closeAllModals = () => {
    setUpgradeModalOpen(false);
    setContextualMessage(null);
  };

  return (
    <ModalContext.Provider 
      value={{ 
        isUpgradeModalOpen, 
        setUpgradeModalOpen, 
        triggerUpgrade, 
        closeAllModals 
      }}
    >
      {children}
      
      {/* Centralized Upgrade Modal:
         Instead of a basic alert, it renders the professional two-column 
         pricing comparison we designed.
      */}
      <UpgradeModal 
        open={isUpgradeModalOpen} 
        onOpenChange={(open) => {
          setUpgradeModalOpen(open);
          if (!open) setContextualMessage(null);
        }}
      />
    </ModalContext.Provider>
  );
};