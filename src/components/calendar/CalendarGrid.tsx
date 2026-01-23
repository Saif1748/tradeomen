import { useMemo } from "react";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  startOfMonth, 
  endOfMonth 
} from "date-fns";
import { Spinner } from "@phosphor-icons/react";
import CalendarDayCell from "./CalendarDayCell";
import { CalendarDayStats } from "@/hooks/use-calendar";
import { useIsMobile } from "@/hooks/use-mobile";

interface CalendarGridProps {
  // ✅ FIX: Use 'currentMonth' (Date object) instead of separate numbers
  currentMonth: Date;
  // ✅ FIX: Expect a plain object/Record
  data: Record<string, CalendarDayStats> | undefined;
  colorMode: 'pnl' | 'winrate';
  // ✅ FIX: Handler passed from parent (Calendar.tsx manages the modal now)
  onDayClick: (stats: CalendarDayStats) => void;
  isLoading?: boolean;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const CalendarGrid = ({ currentMonth, data, colorMode, onDayClick, isLoading }: CalendarGridProps) => {
  const isMobile = useIsMobile();
  const today = new Date();

  // ✅ INDUSTRY GRADE: Robust 42-day grid generation using date-fns
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    // This usually generates 35 or 42 days depending on the month
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // Helper to ensure keys match SQL format (YYYY-MM-DD)
  const getDateKey = (date: Date) => format(date, 'yyyy-MM-dd');

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[300px]">
        <Spinner className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {(isMobile ? WEEKDAYS_SHORT : WEEKDAYS).map((day, index) => (
          <div
            key={index}
            className="text-center text-[10px] sm:text-sm font-medium text-muted-foreground py-1 sm:py-2 select-none"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map((date) => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const dateKey = getDateKey(date);
          
          // ✅ FIX: Safe Object Access (O(1) Lookup)
          // We only look up data if it's the current month
          const dayData = (isCurrentMonth && data) ? data[dateKey] : null;

          return (
            <CalendarDayCell
              key={dateKey} // Using date string as key is better for React diffing
              day={date.getDate()}
              date={date}
              dayData={dayData}
              isCurrentMonth={isCurrentMonth}
              isToday={isSameDay(date, today)}
              colorMode={colorMode}
              // ✅ Trigger parent handler instead of local state
              onClick={() => dayData && onDayClick(dayData)}
            />
          );
        })}
      </div>
    </>
  );
};

export default CalendarGrid;