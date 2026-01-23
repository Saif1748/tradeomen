// src/components/trades/EditTradeModal.tsx
import { useState, useEffect, useMemo } from "react";
import { Spinner, CheckCircle, Warning, Article, ChartLine, ListDashes, PencilSimple, LockKey } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { tradesApi } from "@/services/api/modules/trades";
import { UITrade } from "@/hooks/use-trades";
import { useStrategies } from "@/hooks/use-strategies";
import { UpdateTradeInput, InstrumentType, TradeSide } from "@/services/api/types";

// Reuse sub-components
import BasicInfoTab from "./BasicInfoTab";
import LevelsTab from "./LevelsTab";
import DetailsTab from "./DetailsTab";

interface EditTradeModalProps {
  trade: UITrade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTrade: (data: { id: string; data: UpdateTradeInput }) => void;
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
  
  // Basic Info (Mostly Read-Only for Financials)
  const [status, setStatus] = useState<"OPEN" | "CLOSED">("CLOSED");
  const [symbol, setSymbol] = useState("");
  const [type, setType] = useState<InstrumentType>("STOCK");
  const [side, setSide] = useState<TradeSide>("LONG");
  const [entryDate, setEntryDate] = useState<Date | undefined>(undefined);
  const [exitDate, setExitDate] = useState<Date | undefined>(undefined);
  
  // Read-Only Display Values
  const [entryPrice, setEntryPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [fees, setFees] = useState("0");
  
  // Levels (Editable)
  const [stopLoss, setStopLoss] = useState("");
  const [target, setTarget] = useState("");
  const [strategyId, setStrategyId] = useState<string | null>(null);
  
  // Details (Editable)
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // === Populate Form Data ===
  useEffect(() => {
    if (trade && open) {
      // Core Identity
      setStatus((trade.status as "OPEN" | "CLOSED") || "CLOSED");
      setSymbol(trade.symbol || "");
      setType((trade.type as InstrumentType) || "STOCK");
      setSide((trade.side as TradeSide) || "LONG");
      
      // Dates
      setEntryDate(trade.date ? new Date(trade.date) : undefined);
      // Logic: If we have an exit date from UI model, use it.
      // Note: UITrade might need updating to carry exitDate if available.
      
      // Financials (Read Only in this view)
      setEntryPrice(trade.entryPrice?.toString() || "");
      setQuantity(trade.quantity?.toString() || "");
      setExitPrice(trade.exitPrice?.toString() || "");
      setFees(trade.fees?.toString() || "0");
      
      // Metadata (Editable)
      setStopLoss(trade.stopLoss?.toString() || "");
      setTarget(trade.target?.toString() || "");
      
      const foundStrategy = availableStrategies.find(s => s.name === trade.strategy);
      setStrategyId(foundStrategy ? foundStrategy.id : null);

      setSelectedTags(trade.tags || []);
      // @ts-ignore - Assuming notes exists on the backend response
      setNotes(trade.notes || ""); 
      
      setSelectedFiles([]);
    }
  }, [trade, open, availableStrategies]);

  // === Submit Handler ===
  const handleSubmit = async () => {
    if (!trade) return;
    setIsSubmitting(true);

    try {
      // Construct Metadata-Only Payload
      const payload: UpdateTradeInput = {
        stop_loss: parseFloat(stopLoss) || undefined,
        target: parseFloat(target) || undefined,
        strategy_id: strategyId || undefined,
        tags: selectedTags,
        notes: notes,
      };

      // 1. Update Trade Metadata
      await onUpdateTrade({ id: trade.id, data: payload });

      // 2. Upload NEW screenshots
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
        {/* === Header === */}
        <DialogHeader className="pt-6 pb-2 px-6 flex-shrink-0 bg-transparent">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 shadow-inner">
              <PencilSimple className="w-5 h-5 text-primary" weight="duotone" />
            </div>
            <div className="space-y-0.5">
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                Edit Trade Details
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground/80 tracking-tight font-medium">
                Update strategies, tags, and notes for {symbol}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* === Info Banner === */}
        <div className="px-6 pb-2">
            <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-400 py-2">
                <LockKey className="h-4 w-4" />
                <AlertDescription className="text-xs ml-2">
                    To modify Price or Quantity, please add a new <strong>Execution</strong> (Scale In/Out) instead of editing the trade directly.
                </AlertDescription>
            </Alert>
        </div>

        {/* === Tabs === */}
        <div className="flex-1 flex flex-col overflow-hidden px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
            
            {/* Tab Navigation */}
            <div className="flex justify-center w-full mb-1 mt-2">
              <TabsList className={cn(
                "h-auto p-1 rounded-full flex-shrink-0 grid grid-cols-3 gap-1",
                "bg-muted/30 backdrop-blur-md border border-white/5",
                "w-full max-w-md" 
              )}>
                {/* Disabled Basic Info Tab visually to reinforce read-only nature */}
                <TabsTrigger 
                  value="basic" 
                  disabled
                  className="h-9 px-4 rounded-full text-xs font-semibold tracking-tight opacity-50 cursor-not-allowed"
                >
                  <div className="flex items-center gap-2 justify-center">
                    <Article className="w-3.5 h-3.5" weight="bold" />
                    <span>Basic (Locked)</span>
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

            {/* === Content === */}
            <div className="flex-1 overflow-y-auto pr-2 mt-2 custom-scrollbar">
              
              {/* Basic Info is rendered but effectively readonly or hidden if on other tabs */}
              <TabsContent value="basic" className="mt-0">
                 {/* We reuse BasicInfoTab but force state updates to be no-ops 
                    or rely on the component handling disabled states if we added a 'disabled' prop.
                    For now, we just don't show it as active/selectable.
                 */}
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

        {/* === Footer === */}
        <div className="py-5 px-6 space-y-3 flex-shrink-0 bg-background/50 backdrop-blur-md">
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
                disabled={isSubmitting}
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

        {/* Scrollbar Styles */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default EditTradeModal;