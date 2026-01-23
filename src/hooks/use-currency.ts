import { createContext, useContext } from "react";

export interface CurrencyContextType {
  currency: string;
  symbol: string;
  rate: number; // ✅ Added: Expose the raw exchange rate
  setCurrency: (code: string) => void;
  format: (amountUSD: number) => string;
}

export const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};