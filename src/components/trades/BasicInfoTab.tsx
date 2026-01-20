import { useState, useEffect } from "react";
import { CalendarBlank, Clock, TrendUp, TrendDown } from "@phosphor-icons/react";
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
import { tradeTypes } from "@/lib/tradesData";

// === Date Formatting Helper ===
const formatDate = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
  return `${month} ${day}, ${year} ${hours}:${minutesStr} ${ampm}`;
};

const formatTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const hoursStr = hours < 10 ? `0${hours}` : hours;
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
  return `${hoursStr}:${minutesStr}`;
};

// === Date & Time Picker Component ===
interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  label?: string;
}

const DateTimePicker = ({ 
  date, 
  setDate, 
  minDate, 
  maxDate, 
  disabled, 
  label = "Pick date & time"
}: DateTimePickerProps) => {
  const [timeValue, setTimeValue] = useState("12:00");

  useEffect(() => {
    if (date) {
      setTimeValue(formatTime(date));
    }
  }, [date]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setDate(undefined);
      return;
    }
    const [hours, minutes] = timeValue.split(":").map(Number);
    const newDate = new Date(selectedDate);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setDate(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);
    
    if (date) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      setDate(newDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full h-10 justify-start text-left font-normal rounded-lg",
            "bg-background/50 backdrop-blur-sm border-white/5",
            "hover:bg-background/80 hover:border-primary/20",
            "transition-all duration-300",
            "shadow-sm",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarBlank className="mr-3 h-4 w-4 text-primary" weight="duotone" />
          {date ? (
            <span className="tracking-tight text-sm">{formatDate(date)}</span>
          ) : (
            <span className="tracking-tight text-sm">{label}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 bg-background/95 backdrop-blur-md border-white/10 shadow-xl rounded-xl" 
        align="start"
      >
        <div className="flex flex-col sm:flex-row">
          <div className="p-4 border-b sm:border-b-0 sm:border-r border-white/10">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={(day) => {
                if (maxDate && day > maxDate) return true;
                if (minDate) {
                  const d = new Date(day); d.setHours(0,0,0,0);
                  const m = new Date(minDate); m.setHours(0,0,0,0);
                  return d < m;
                }
                return false;
              }}
              initialFocus
              className="rounded-md"
            />
          </div>
          <div className="p-6 flex flex-col gap-5 sm:w-[200px]">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" weight="duotone" />
              <span className="text-sm font-medium tracking-tight">Select Time</span>
            </div>
            <Input
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              className="h-10 rounded-lg bg-background/50 backdrop-blur-sm border-white/10 focus:border-primary/50 transition-all duration-300"
            />
            <div className="text-xs text-muted-foreground/70 leading-relaxed mt-auto">
              <p className="tracking-tight">Choose date from calendar and adjust time above.</p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// === Main Component ===
interface BasicInfoTabProps {
  status: "OPEN" | "CLOSED";
  setStatus: (status: "OPEN" | "CLOSED") => void;
  symbol: string;
  setSymbol: (symbol: string) => void;
  type: string;
  setType: (type: string) => void;
  side: string;
  setSide: (side: string) => void;
  entryDate: Date | undefined;
  setEntryDate: (date: Date | undefined) => void;
  entryPrice: string;
  setEntryPrice: (price: string) => void;
  quantity: string;
  setQuantity: (quantity: string) => void;
  exitDate: Date | undefined;
  setExitDate: (date: Date | undefined) => void;
  exitPrice: string;
  setExitPrice: (price: string) => void;
  fees: string;
  setFees: (fees: string) => void;
}

const BasicInfoTab = ({
  status,
  setStatus,
  symbol,
  setSymbol,
  type,
  setType,
  side,
  setSide,
  entryDate,
  setEntryDate,
  entryPrice,
  setEntryPrice,
  quantity,
  setQuantity,
  exitDate,
  setExitDate,
  exitPrice,
  setExitPrice,
  fees,
  setFees,
}: BasicInfoTabProps) => {
  
  // === Updated Duration Logic ===
  const calculateHoldTime = () => {
    if (!entryDate || !exitDate) return "0m";
    
    const diffMs = exitDate.getTime() - entryDate.getTime();
    if (diffMs < 0) return "0m";

    const msPerMinute = 1000 * 60;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;

    const days = Math.floor(diffMs / msPerDay);
    const hours = Math.floor((diffMs % msPerDay) / msPerHour);
    const minutes = Math.floor((diffMs % msPerHour) / msPerMinute);

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <div className="space-y-6 py-2">
      
      {/* === Status Toggle === */}
      <div className="space-y-2.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 ml-1">
          Trade Status
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-10 rounded-lg relative overflow-hidden transition-all duration-300 tracking-tight",
              "border-white/5 backdrop-blur-sm",
              status === "OPEN"
                ? "bg-primary/10 text-primary border-primary/30 shadow-sm"
                : "bg-background/50 text-muted-foreground hover:bg-background/80"
            )}
            onClick={() => setStatus("OPEN")}
          >
            <span className="relative z-10 font-medium text-sm">Open Position</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-10 rounded-lg relative overflow-hidden transition-all duration-300 tracking-tight",
              "border-white/5 backdrop-blur-sm",
              status === "CLOSED"
                ? "bg-primary/10 text-primary border-primary/30 shadow-sm"
                : "bg-background/50 text-muted-foreground hover:bg-background/80"
            )}
            onClick={() => setStatus("CLOSED")}
          >
            <span className="relative z-10 font-medium text-sm">Closed Trade</span>
          </Button>
        </div>
      </div>

      {/* === Symbol, Type, Direction === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Symbol */}
        <div className="space-y-2">
          <Label className="text-xs font-medium tracking-tight text-foreground/80 ml-1">
            Symbol
          </Label>
          <div className="relative group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/70 font-bold text-base">
              $
            </span>
            <Input
              placeholder="AAPL"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className={cn(
                "h-10 pl-7 rounded-lg uppercase tracking-tight font-medium",
                "bg-background/50 backdrop-blur-sm border-white/5",
                "focus:border-primary/50 focus:shadow-sm",
                "transition-all duration-300 placeholder:text-muted-foreground/40"
              )}
            />
          </div>
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label className="text-xs font-medium tracking-tight text-foreground/80 ml-1">
            Type
          </Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-10 rounded-lg bg-background/50 backdrop-blur-sm border-white/5 focus:border-primary/50 transition-all duration-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-md border-white/10 rounded-xl">
              {(tradeTypes || ["STOCK", "CRYPTO", "FOREX", "OPTIONS"]).map((t) => (
                <SelectItem key={t} value={t} className="tracking-tight text-sm">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Direction */}
        <div className="space-y-2">
          <Label className="text-xs font-medium tracking-tight text-foreground/80 ml-1">
            Direction
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-10 rounded-lg transition-all duration-300 tracking-tight",
                "border-white/5 backdrop-blur-sm",
                side === "LONG"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-sm"
                  : "bg-background/50 text-muted-foreground hover:bg-background/80"
              )}
              onClick={() => setSide("LONG")}
            >
              <TrendUp className="mr-1.5 h-4 w-4" weight="bold" />
              <span className="text-sm">Long</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-10 rounded-lg transition-all duration-300 tracking-tight",
                "border-white/5 backdrop-blur-sm",
                side === "SHORT"
                  ? "bg-rose-500/10 text-rose-500 border-rose-500/30 shadow-sm"
                  : "bg-background/50 text-muted-foreground hover:bg-background/80"
              )}
              onClick={() => setSide("SHORT")}
            >
              <TrendDown className="mr-1.5 h-4 w-4" weight="bold" />
              <span className="text-sm">Short</span>
            </Button>
          </div>
        </div>
      </div>

      {/* === Entry Section === */}
      <div className="space-y-3.5 p-5 rounded-xl bg-muted/5 border border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          <Label className="text-sm font-semibold tracking-tight text-foreground">
            Entry Details
          </Label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium tracking-tight text-muted-foreground/80 ml-1">
              Date & Time
            </Label>
            <DateTimePicker 
              date={entryDate}
              setDate={setEntryDate}
              maxDate={new Date()}
              label="Select time"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium tracking-tight text-muted-foreground/80 ml-1">
              Price
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="h-10 rounded-lg bg-background/50 backdrop-blur-sm border-white/5 focus:border-primary/50 transition-all duration-300 placeholder:text-muted-foreground/40"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium tracking-tight text-muted-foreground/80 ml-1">
              Quantity
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="h-10 rounded-lg bg-background/50 backdrop-blur-sm border-white/5 focus:border-primary/50 transition-all duration-300 placeholder:text-muted-foreground/40"
            />
          </div>
        </div>
      </div>

      {/* === Exit Section (Conditional) === */}
      {status === "CLOSED" && (
        <div className="space-y-3.5 p-5 rounded-xl bg-muted/5 border border-white/5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
              <Label className="text-sm font-semibold tracking-tight text-foreground">
                Exit Details
              </Label>
            </div>
            {entryDate && exitDate && (
              <div className="text-xs text-muted-foreground tracking-tight">
                Hold: <span className="text-primary font-semibold">{calculateHoldTime()}</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium tracking-tight text-muted-foreground/80 ml-1">
                Date & Time
              </Label>
              <DateTimePicker 
                date={exitDate}
                setDate={setExitDate}
                minDate={entryDate}
                maxDate={new Date()}
                disabled={!entryDate}
                label="Select time"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium tracking-tight text-muted-foreground/80 ml-1">
                Price
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                className="h-10 rounded-lg bg-background/50 backdrop-blur-sm border-white/5 focus:border-primary/50 transition-all duration-300 placeholder:text-muted-foreground/40"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium tracking-tight text-muted-foreground/80 ml-1">
                Fees
              </Label>
              <Input
                type="number"
                step="0.01"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                className="h-10 rounded-lg bg-background/50 backdrop-blur-sm border-white/5 focus:border-primary/50 transition-all duration-300 placeholder:text-muted-foreground/40"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicInfoTab;