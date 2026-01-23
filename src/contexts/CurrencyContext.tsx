import { ReactNode, useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-Auth";
import { authApi } from "@/services/api/modules/auth";
import { toast } from "sonner";
import { CurrencyContext } from "@/hooks/use-currency";

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const { profile, refreshProfile } = useAuth();

  const [currency, setCurrencyState] = useState("USD");
  const [rate, setRate] = useState<number>(1);

  // 1. Sync currency from backend profile on load
  useEffect(() => {
    if (profile?.preferences?.currency) {
      setCurrencyState(profile.preferences.currency);
    }
  }, [profile]);

  // 2. Fetch Real-time Exchange Rates
  useEffect(() => {
    if (currency === "USD") {
      setRate(1);
      return;
    }

    let cancelled = false;

    const fetchRate = async () => {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();

        if (
          !cancelled &&
          data?.result === "success" &&
          data?.rates?.[currency]
        ) {
          setRate(data.rates[currency]);
        }
      } catch (err) {
        console.error("FX rate fetch failed:", err);
      }
    };

    fetchRate();

    return () => {
      cancelled = true;
    };
  }, [currency]);

  // 3. Set Currency & Persist to Backend
  const setCurrency = async (code: string) => {
    // Optimistic Update
    setCurrencyState(code);

    try {
      const currentPrefs = profile?.preferences || {};

      // Save to Database
      await authApi.updateProfile({
        preferences: {
          ...currentPrefs,
          currency: code,
        },
      });

      // Refresh global auth state
      await refreshProfile();

      toast.success(`Currency changed to ${code}`);
    } catch (error) {
      console.error("Failed to save currency preference:", error);
      toast.error("Failed to save currency preference");
    }
  };

  // Helper: Get Symbol (e.g. $, €, ₹)
  const getSymbol = (currencyCode: string) => {
    try {
      return (0)
        .toLocaleString("en-US", {
          style: "currency",
          currency: currencyCode,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
        .replace(/\d/g, "")
        .trim();
    } catch {
      return currencyCode;
    }
  };

  const symbol = useMemo(() => getSymbol(currency), [currency]);

  // Helper: Format Amount (USD Input -> Converted Output)
  const format = (amountUSD: number) => {
    const converted = amountUSD * rate;
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        symbol,
        rate, // ✅ Added: Pass the rate to consumers
        setCurrency,
        format,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};