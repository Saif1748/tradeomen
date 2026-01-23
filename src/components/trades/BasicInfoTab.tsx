// src/components/trades/BasicInfoTab.tsx
import { useState } from "react";
import { 
  Plus, 
  Trash, 
  CalendarBlank, 
  TrendUp, 
  TrendDown 
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { InstrumentType, ExecutionSide } from "@/services/api/types";
import { format } from "date-fns";

// === Types ===
export interface ExecutionItem {
  id: string; // temp frontend ID
  date: Date;
  side: ExecutionSide;
  price: string;
  quantity: string;
  fees: string;
}

interface BasicInfoTabProps {
  symbol: string;
  setSymbol: (val: string) => void;
  type: InstrumentType;
  setType: (val: InstrumentType) => void;
  executions: ExecutionItem[];
  setExecutions: (val: ExecutionItem[]) => void;
}

// ✅ FIX: Explicitly define valid backend Enums to prevent casing errors
const VALID_INSTRUMENTS: InstrumentType[] = ["STOCK", "CRYPTO", "FOREX", "FUTURES"];

// === Date Picker Helper ===
const DateTimePicker = ({ 
  date, 
  setDate 
}: { 
  date: Date; 
  setDate: (d: Date) => void 
}) => {
  const [timeValue, setTimeValue] = useState(format(date, "HH:mm"));

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    const [hours, minutes] = timeValue.split(":").map(Number);
    const newDate = new Date(selectedDate);
    newDate.setHours(hours || 0);
    newDate.setMinutes(minutes || 0);
    setDate(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);
    const [hours, minutes] = newTime.split(":").map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours || 0);
    newDate.setMinutes(minutes || 0);
    setDate(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full h-9 justify-start text-left font-normal rounded-lg px-3",
            "bg-background/50 border-white/10 hover:bg-background/80",
            "text-xs"
          )}
        >
          <CalendarBlank className="mr-2 h-3.5 w-3.5 text-primary" />
          {format(date, "MMM dd, HH:mm")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
        <div className="flex flex-col sm:flex-row">
          <div className="p-3 border-b sm:border-b-0 sm:border-r border-border">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
            />
          </div>
          <div className="p-4 flex flex-col gap-4">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Time</span>
              <Input
                type="time"
                value={timeValue}
                onChange={handleTimeChange}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const BasicInfoTab = ({
  symbol,
  setSymbol,
  type,
  setType,
  executions,
  setExecutions,
}: BasicInfoTabProps) => {

  const updateExecution = (id: string, field: keyof ExecutionItem, value: any) => {
    setExecutions(executions.map(ex => 
      ex.id === id ? { ...ex, [field]: value } : ex
    ));
  };

  const removeExecution = (id: string) => {
    if (executions.length <= 1) return; // Prevent removing last one
    setExecutions(executions.filter(ex => ex.id !== id));
  };

  const addExecution = () => {
    const lastExec = executions[executions.length - 1];
    setExecutions([
      ...executions,
      {
        id: crypto.randomUUID(),
        date: lastExec ? new Date(lastExec.date) : new Date(),
        side: lastExec?.side === "BUY" ? "SELL" : "BUY", // Toggle side for convenience
        price: "",
        quantity: "",
        fees: "0"
      }
    ]);
  };

  // Calculate Net Qty for UI feedback
  const netQty = executions.reduce((acc, ex) => {
    const qty = parseFloat(ex.quantity) || 0;
    return ex.side === "BUY" ? acc + qty : acc - qty;
  }, 0);

  return (
    <div className="space-y-6 py-2">
      
      {/* === Trade Identity === */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground ml-1">Symbol</Label>
          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/70 font-bold text-sm">$</span>
            <Input
              placeholder="BTCUSD"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="pl-6 h-9 uppercase font-semibold bg-background/50 border-white/5 focus:border-primary/50"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground ml-1">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as InstrumentType)}>
            <SelectTrigger className="h-9 bg-background/50 border-white/5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {/* ✅ FIX: Use local VALID_INSTRUMENTS instead of tradeTypes to ensure Uppercase */}
              {VALID_INSTRUMENTS.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* === Executions List === */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <Label className="text-xs font-semibold text-foreground flex items-center gap-2">
            Executions
            <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px] text-muted-foreground">
              {executions.length}
            </span>
          </Label>
          <div className="text-[10px] text-muted-foreground">
            Net Qty: <span className={cn("font-mono font-medium", netQty === 0 ? "text-muted-foreground" : netQty > 0 ? "text-emerald-500" : "text-rose-500")}>
              {netQty}
            </span>
            {netQty === 0 && <span className="ml-2 text-xs text-blue-400 font-medium">(CLOSED)</span>}
          </div>
        </div>

        <div className="space-y-3">
          {executions.map((ex, idx) => (
            <div 
              key={ex.id} 
              className="relative p-3 rounded-xl border border-white/5 bg-background/30 hover:bg-background/50 transition-colors group"
            >
              {/* Row 1: Header + Delete */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-md",
                    ex.side === "BUY" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                  )}>
                    {ex.side === "BUY" ? <TrendUp weight="bold" className="w-3.5 h-3.5" /> : <TrendDown weight="bold" className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex gap-1 p-0.5 rounded-lg bg-background/50 border border-white/5">
                    <button
                      type="button"
                      onClick={() => updateExecution(ex.id, "side", "BUY")}
                      className={cn(
                        "px-3 py-1 rounded-md text-[10px] font-bold transition-all",
                        ex.side === "BUY" ? "bg-emerald-500 text-white shadow-sm" : "text-muted-foreground hover:text-emerald-500"
                      )}
                    >
                      BUY
                    </button>
                    <button
                      type="button"
                      onClick={() => updateExecution(ex.id, "side", "SELL")}
                      className={cn(
                        "px-3 py-1 rounded-md text-[10px] font-bold transition-all",
                        ex.side === "SELL" ? "bg-rose-500 text-white shadow-sm" : "text-muted-foreground hover:text-rose-500"
                      )}
                    >
                      SELL
                    </button>
                  </div>
                </div>

                {executions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeExecution(ex.id)}
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              {/* Row 2: Inputs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-[10px] text-muted-foreground mb-1 block">Date</Label>
                  <DateTimePicker 
                    date={ex.date} 
                    setDate={(d) => updateExecution(ex.id, "date", d)} 
                  />
                </div>
                
                <div>
                  <Label className="text-[10px] text-muted-foreground mb-1 block">Qty</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={ex.quantity}
                    onChange={(e) => updateExecution(ex.id, "quantity", e.target.value)}
                    className="h-9 text-xs bg-background/50 border-white/5"
                  />
                </div>

                <div>
                  <Label className="text-[10px] text-muted-foreground mb-1 block">Price</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={ex.price}
                    onChange={(e) => updateExecution(ex.id, "price", e.target.value)}
                    className="h-9 text-xs bg-background/50 border-white/5"
                  />
                </div>

                <div>
                  <Label className="text-[10px] text-muted-foreground mb-1 block">Fees</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={ex.fees}
                    onChange={(e) => updateExecution(ex.id, "fees", e.target.value)}
                    className="h-9 text-xs bg-background/50 border-white/5"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addExecution}
          className="w-full h-9 border-dashed border-white/10 bg-transparent hover:bg-primary/5 hover:border-primary/30 text-xs text-muted-foreground hover:text-primary gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Another Execution
        </Button>
      </div>
    </div>
  );
};

export default BasicInfoTab;