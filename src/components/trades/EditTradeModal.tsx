import { useState, useEffect, useMemo } from "react";
import { Spinner, CheckCircle, Warning, Article, ChartLine, ListDashes, PencilSimple } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { tradesApi } from "@/services/api/modules/trades";
import { UITrade } from "@/hooks/use-trades";
import { useStrategies } from "@/hooks/use-strategies";

// Reuse the exact same sub-components for consistency
import BasicInfoTab from "./BasicInfoTab";
import LevelsTab from "./LevelsTab";
import DetailsTab from "./DetailsTab";

interface EditTradeModalProps {
  trade: UITrade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTrade: (data: any) => void;
}

const EditTradeModal = ({ 
  trade, 
  open, 
  onOpenChange, 
  onUpdateTrade 
}: EditTradeModalProps) => {
  const { strategies: availableStrategies } = useStrategies();
  
  // === State Management ===
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Basic Info
  const [status, setStatus] = useState<"OPEN" | "CLOSED">("CLOSED");
  const [symbol, setSymbol] = useState("");
  const [type, setType] = useState("STOCK");
  const [side, setSide] = useState("LONG");
  const [entryDate, setEntryDate] = useState<Date | undefined>(undefined);
  const [exitDate, setExitDate] = useState<Date | undefined>(undefined);
  const [entryPrice, setEntryPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [fees, setFees] = useState("0");
  
  // Levels
  const [stopLoss, setStopLoss] = useState("");
  const [target, setTarget] = useState("");
  const [strategyId, setStrategyId] = useState<string | null>(null);
  
  // Details
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // === Populate Form Data ===
  useEffect(() => {
    if (trade && open) {
      setStatus((trade.status as "OPEN" | "CLOSED") || "CLOSED");
      setSymbol(trade.symbol || "");
      setType(trade.type || "STOCK");
      setSide(trade.side || "LONG");
      
      setEntryDate(trade.date ? new Date(trade.date) : undefined);
      // For editing, ensure exit date exists or fallback if closed
      setExitDate(trade.exitDate ? new Date(trade.exitDate) : undefined);
      
      setEntryPrice(trade.entryPrice?.toString() || "");
      setQuantity(trade.quantity?.toString() || "");
      setExitPrice(trade.exitPrice?.toString() || "");
      setFees(trade.fees?.toString() || "0");
      
      setStopLoss(trade.stopLoss?.toString() || "");
      setTarget(trade.target?.toString() || "");
      
      // Match strategy name to ID for the select box
      const foundStrategy = availableStrategies.find(s => s.name === trade.strategy);
      setStrategyId(foundStrategy ? foundStrategy.id : null);

      setSelectedTags(trade.tags || []);
      // @ts-ignore - Assuming notes exists on the backend response even if not in UITrade type yet
      setNotes(trade.notes || ""); 
      
      // Reset files on open (we don't load existing images into the file input)
      setSelectedFiles([]);
    }
  }, [trade, open, availableStrategies]);

  // === Validation ===
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    
    // Date validation
    if (entryDate && exitDate && status === "CLOSED") {
      if (exitDate < entryDate) {
        errors.push("Exit date cannot be before entry date");
      }
    }
    
    // Stop Loss / Target Logic
    const sl = parseFloat(stopLoss) || 0;
    const tgt = parseFloat(target) || 0;
    const entry = parseFloat(entryPrice) || 0;
    
    if (sl > 0 && entry > 0) {
      if (side === "LONG" && sl >= entry) {
        errors.push("Stop loss must be below entry for LONG");
      }
      if (side === "SHORT" && sl <= entry) {
        errors.push("Stop loss must be above entry for SHORT");
      }
    }
    
    if (tgt > 0 && entry > 0) {
      if (side === "LONG" && tgt <= entry) {
        errors.push("Target must be above entry for LONG");
      }
      if (side === "SHORT" && tgt >= entry) {
        errors.push("Target must be below entry for SHORT");
      }
    }
    
    return errors;
  }, [entryDate, exitDate, entryPrice, stopLoss, target, side, status]);

  // === Check Required Fields ===
  const hasRequiredFields = useMemo(() => {
    return symbol && entryPrice && quantity && entryDate;
  }, [symbol, entryPrice, quantity, entryDate]);

  // === Submit Handler ===
  const handleSubmit = async () => {
    if (!trade) return;

    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => toast.error(error));
      return;
    }

    if (!hasRequiredFields) {
      toast.error("Please fill in Symbol, Entry Date, Price, and Quantity.");
      return;
    }

    const numericEntryPrice = parseFloat(entryPrice);
    const numericQuantity = parseFloat(quantity);

    if (isNaN(numericEntryPrice) || numericEntryPrice <= 0) {
      toast.error("Please enter a valid Price greater than 0");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare payload
      const payload = {
        id: trade.id, // Important for update
        symbol: symbol.toUpperCase(),
        instrument_type: type.toUpperCase(),
        direction: side.toUpperCase(),
        status: status.toUpperCase(),
        entry_time: entryDate?.toISOString(),
        exit_time: status === "CLOSED" && exitDate ? exitDate.toISOString() : null,
        entry_price: numericEntryPrice,
        exit_price: status === "CLOSED" ? (parseFloat(exitPrice) || numericEntryPrice) : null,
        quantity: numericQuantity,
        fees: parseFloat(fees) || 0,
        stop_loss: parseFloat(stopLoss) || null,
        target: parseFloat(target) || null,
        strategy_id: strategyId || null,
        tags: selectedTags,
        notes: notes,
      };

      // 1. Update Trade Data
      await onUpdateTrade(payload);

      // 2. Upload NEW screenshots if any selected
      if (selectedFiles.length > 0) {
        try {
          const uploadRes = await tradesApi.uploadScreenshots(selectedFiles, trade.id);
          if (uploadRes.uploaded_to_trade) {
            toast.success("Trade updated and screenshots uploaded");
          }
        } catch (uploadError) {
          console.error("Screenshot upload failed", uploadError);
          toast.error("Trade updated, but failed to upload new screenshots.");
        }
      } else {
        toast.success("Trade updated successfully");
      }

      onOpenChange(false);
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.detail || error.message || "Failed to update trade");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!trade) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "max-w-3xl flex flex-col p-0",
          "h-[85vh] sm:h-[88vh]", 
          "bg-background/95 backdrop-blur-xl",
          "border border-white/10",
          "rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
        )}
      >
        {/* === Header (No Border) === */}
        <DialogHeader className="pt-6 pb-2 px-6 flex-shrink-0 bg-transparent">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 shadow-inner">
              <PencilSimple className="w-5 h-5 text-primary" weight="duotone" />
            </div>
            <div className="space-y-0.5">
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                Edit Trade
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground/80 tracking-tight font-medium">
                Modify execution details for {symbol}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* === Tabs === */}
        <div className="flex-1 flex flex-col overflow-hidden px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
            
            {/* Elongated Tab List Container */}
            <div className="flex justify-center w-full mb-1 mt-2">
              <TabsList className={cn(
                "h-auto p-1 rounded-full flex-shrink-0 grid grid-cols-3 gap-1",
                "bg-muted/30 backdrop-blur-md border border-white/5",
                "w-full max-w-md" 
              )}>
                <TabsTrigger 
                  value="basic" 
                  className={cn(
                    "h-9 px-4 rounded-full text-xs font-semibold tracking-tight transition-all duration-300 border border-transparent",
                    "data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20",
                    "data-[state=active]:shadow-sm",
                    "data-[state=inactive]:text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-2 justify-center">
                    <Article className="w-3.5 h-3.5" weight="bold" />
                    <span>Basic Info</span>
                  </div>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="levels" 
                  className={cn(
                    "h-9 px-4 rounded-full text-xs font-semibold tracking-tight transition-all duration-300 border border-transparent",
                    "data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20",
                    "data-[state=active]:shadow-sm",
                    "data-[state=inactive]:text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-2 justify-center">
                    <ChartLine className="w-3.5 h-3.5" weight="bold" />
                    <span>Risk & Strategy</span>
                  </div>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="details" 
                  className={cn(
                    "h-9 px-4 rounded-full text-xs font-semibold tracking-tight transition-all duration-300 border border-transparent",
                    "data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20",
                    "data-[state=active]:shadow-sm",
                    "data-[state=inactive]:text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                   <div className="flex items-center gap-2 justify-center">
                    <ListDashes className="w-3.5 h-3.5" weight="bold" />
                    <span>Details</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* === Scrollable Content === */}
            <div className="flex-1 overflow-y-auto pr-2 mt-2 custom-scrollbar">
              <TabsContent value="basic" className="mt-0 animate-in fade-in-50 zoom-in-95 duration-300">
                <BasicInfoTab
                  status={status}
                  setStatus={setStatus}
                  symbol={symbol}
                  setSymbol={setSymbol}
                  type={type}
                  setType={setType}
                  side={side}
                  setSide={setSide}
                  entryDate={entryDate}
                  setEntryDate={setEntryDate}
                  entryPrice={entryPrice}
                  setEntryPrice={setEntryPrice}
                  quantity={quantity}
                  setQuantity={setQuantity}
                  exitDate={exitDate}
                  setExitDate={setExitDate}
                  exitPrice={exitPrice}
                  setExitPrice={setExitPrice}
                  fees={fees}
                  setFees={setFees}
                />
              </TabsContent>

              <TabsContent value="levels" className="mt-0 animate-in fade-in-50 zoom-in-95 duration-300">
                <LevelsTab
                  stopLoss={stopLoss}
                  setStopLoss={setStopLoss}
                  target={target}
                  setTarget={setTarget}
                  strategyId={strategyId}
                  setStrategyId={setStrategyId}
                  side={side}
                  entryPrice={entryPrice}
                />
              </TabsContent>

              <TabsContent value="details" className="mt-0 animate-in fade-in-50 zoom-in-95 duration-300">
                <DetailsTab
                  selectedTags={selectedTags}
                  setSelectedTags={setSelectedTags}
                  tagInput={tagInput}
                  setTagInput={setTagInput}
                  notes={notes}
                  setNotes={setNotes}
                  selectedFiles={selectedFiles}
                  setSelectedFiles={setSelectedFiles}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* === Footer (No Border) === */}
        <div className="py-5 px-6 space-y-3 flex-shrink-0 bg-background/50 backdrop-blur-md">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/20">
              <Warning className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" weight="duotone" />
              <div className="space-y-1">
                {validationErrors.map((error, idx) => (
                  <p key={idx} className="text-xs text-rose-400 tracking-tight">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className={cn(
                "h-10 px-6 tracking-tight font-medium text-sm rounded-xl",
                "bg-background/50 backdrop-blur-sm border-white/5",
                "hover:bg-background/80",
                "transition-all duration-300"
              )}
            >
              Cancel
            </Button>

            <div className="flex items-center gap-4">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || validationErrors.length > 0 || !hasRequiredFields}
                className={cn(
                  "h-10 px-8 tracking-tight font-semibold relative overflow-hidden rounded-xl",
                  "bg-primary hover:bg-primary/90 text-white",
                  "shadow-lg shadow-primary/25",
                  "transition-all duration-300",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="animate-spin w-4 h-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" weight="bold" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Custom Scrollbar Styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default EditTradeModal;