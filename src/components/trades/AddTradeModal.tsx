// src/components/trades/AddTradeModal.tsx
import { useState, useMemo } from "react";
import { Spinner, CheckCircle, Warning, Article, ChartLine, ListDashes } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
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
import { CreateTradeInput, ExecutionCreate, InstrumentType, TradeSide } from "@/services/api/types";

// Child Components
import BasicInfoTab, { ExecutionItem } from "./BasicInfoTab";
import LevelsTab from "./LevelsTab";
import DetailsTab from "./DetailsTab";

interface AddTradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddTradeModal = ({ open, onOpenChange }: AddTradeModalProps) => {
  const queryClient = useQueryClient();
  
  // === State Management ===
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Global Info
  const [symbol, setSymbol] = useState("");
  const [type, setType] = useState<InstrumentType>("STOCK");
  
  // Executions (List)
  // Initialize with one empty execution
  const [executions, setExecutions] = useState<ExecutionItem[]>([
    {
      id: "init-1",
      date: new Date(),
      side: "BUY",
      price: "",
      quantity: "",
      fees: "0"
    }
  ]);

  // Levels
  const [stopLoss, setStopLoss] = useState("");
  const [target, setTarget] = useState("");
  const [strategyId, setStrategyId] = useState<string | null>(null);
  
  // Details
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // === Derived State ===
  // Estimate direction from the first execution for UI consistency
  const primarySide: TradeSide = executions[0]?.side === "BUY" ? "LONG" : "SHORT";
  const primaryPrice = executions[0]?.price || ""; 

  // === Reset Form ===
  const resetForm = () => {
    setActiveTab("basic");
    setSymbol("");
    setType("STOCK");
    setExecutions([{
      id: crypto.randomUUID(),
      date: new Date(),
      side: "BUY",
      price: "",
      quantity: "",
      fees: "0"
    }]);
    setStopLoss("");
    setTarget("");
    setStrategyId(null);
    setSelectedTags([]);
    setTagInput("");
    setNotes("");
    setSelectedFiles([]);
  };

  // === Validation ===
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    
    if (!symbol) errors.push("Symbol is required");
    
    executions.forEach((ex, idx) => {
      if (!ex.price || parseFloat(ex.price) <= 0) errors.push(`Execution #${idx + 1}: Invalid Price`);
      if (!ex.quantity || parseFloat(ex.quantity) <= 0) errors.push(`Execution #${idx + 1}: Invalid Quantity`);
    });

    // Validate Stop Loss / Target relative to First Entry
    const entry = parseFloat(primaryPrice);
    const sl = parseFloat(stopLoss);
    // const tgt = parseFloat(target); // Target validation is less strict usually

    if (entry > 0 && sl > 0) {
      if (primarySide === "LONG" && sl >= entry) errors.push("Stop Loss must be below entry for Longs");
      if (primarySide === "SHORT" && sl <= entry) errors.push("Stop Loss must be above entry for Shorts");
    }
    
    return errors;
  }, [symbol, executions, stopLoss, target, primarySide, primaryPrice]);

  const hasRequiredFields = symbol && executions.length > 0 && executions.every(e => e.price && e.quantity);

  // === Submit Handler ===
  const handleSubmit = async () => {
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => toast.error(error));
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Sort Executions Chronologically to ensure correct PnL calculation
      const sortedExecs = [...executions].sort((a, b) => a.date.getTime() - b.date.getTime());
      
      const firstExec = sortedExecs[0];
      const remainingExecs = sortedExecs.slice(1);

      // 2. Prepare First Execution Payload (Creates the Trade Container)
      const initialPayload: CreateTradeInput = {
        symbol: symbol.toUpperCase(),
        instrument_type: type,
        direction: firstExec.side === "BUY" ? "LONG" : "SHORT", 
        
        stop_loss: parseFloat(stopLoss) || undefined,
        target: parseFloat(target) || undefined,
        notes: notes,
        tags: selectedTags,
        strategy_id: strategyId || undefined,

        initial_execution: {
            execution_time: firstExec.date.toISOString(),
            side: firstExec.side,
            price: parseFloat(firstExec.price),
            quantity: parseFloat(firstExec.quantity),
            fees: parseFloat(firstExec.fees) || 0,
        }
      };

      // 3. Create Trade
      const newTrade = await tradesApi.create(initialPayload);

      // 4. Chain Remaining Executions (if any)
      if (remainingExecs.length > 0) {
        // We execute these sequentially or in parallel. Parallel is usually fine for DB, 
        // but sequential ensures `recalculate_trade_state` runs in cleaner order if backend doesn't lock.
        // Using Promise.all for speed, relying on backend timestamp sorting.
        await Promise.all(remainingExecs.map(ex => {
            const execPayload: ExecutionCreate = {
                execution_time: ex.date.toISOString(),
                side: ex.side,
                price: parseFloat(ex.price),
                quantity: parseFloat(ex.quantity),
                fees: parseFloat(ex.fees) || 0
            };
            return tradesApi.addExecution(newTrade.id, execPayload);
        }));
      }

      // 5. Upload Screenshots
      if (selectedFiles.length > 0) {
        await tradesApi.uploadScreenshots(selectedFiles, newTrade.id);
      }

      // 6. Success & Cleanup
      toast.success(`Trade logged with ${executions.length} executions`);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      
      resetForm();
      onOpenChange(false);

    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to log trade");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {/* Header */}
        <DialogHeader className="pt-6 pb-2 px-6 flex-shrink-0 bg-transparent">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 shadow-inner">
              <CheckCircle className="w-5 h-5 text-primary" weight="duotone" />
            </div>
            <div className="space-y-0.5">
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                Log New Trade
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground/80 tracking-tight font-medium">
                Add one or multiple executions
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex-1 flex flex-col overflow-hidden px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex justify-center w-full mb-1 mt-2">
              <TabsList className="h-auto p-1 rounded-full flex-shrink-0 grid grid-cols-3 gap-1 bg-muted/30 backdrop-blur-md border border-white/5 w-full max-w-md">
                <TabsTrigger 
                  value="basic" 
                  className="h-9 px-4 rounded-full text-xs font-semibold data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Article className="w-3.5 h-3.5 mr-2" weight="bold" /> Executions
                </TabsTrigger>
                <TabsTrigger 
                  value="levels" 
                  className="h-9 px-4 rounded-full text-xs font-semibold data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <ChartLine className="w-3.5 h-3.5 mr-2" weight="bold" /> Strategy
                </TabsTrigger>
                <TabsTrigger 
                  value="details" 
                  className="h-9 px-4 rounded-full text-xs font-semibold data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <ListDashes className="w-3.5 h-3.5 mr-2" weight="bold" /> Details
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 mt-2 custom-scrollbar">
              <TabsContent value="basic" className="mt-0">
                <BasicInfoTab
                  symbol={symbol}
                  setSymbol={setSymbol}
                  type={type}
                  setType={setType}
                  executions={executions}
                  setExecutions={setExecutions}
                />
              </TabsContent>

              <TabsContent value="levels" className="mt-0">
                <LevelsTab
                  stopLoss={stopLoss}
                  setStopLoss={setStopLoss}
                  target={target}
                  setTarget={setTarget}
                  strategyId={strategyId}
                  setStrategyId={setStrategyId}
                  side={primarySide}
                  entryPrice={primaryPrice}
                />
              </TabsContent>

              <TabsContent value="details" className="mt-0">
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

        {/* Footer */}
        <div className="py-5 px-6 space-y-3 flex-shrink-0 bg-background/50 backdrop-blur-md border-t border-white/5">
          {validationErrors.length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/20">
              <Warning className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                {validationErrors.map((error, idx) => (
                  <p key={idx} className="text-xs text-rose-400">{error}</p>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !hasRequiredFields}
              className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="animate-spin w-4 h-4 mr-2" /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" weight="bold" />
                  Save {executions.length} Executions
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTradeModal;