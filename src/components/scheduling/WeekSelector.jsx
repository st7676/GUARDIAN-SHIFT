import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';

function WeekSelector({ selectedWeek, onWeekChange }) {
  const weekStart = React.useMemo(
    () => startOfWeek(selectedWeek, { weekStartsOn: 0 }),
    [selectedWeek]
  );
  const weekEnd = React.useMemo(
    () => addDays(weekStart, 6),
    [weekStart]
  );

  return (
    <div className="flex items-center gap-4">
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => onWeekChange(subWeeks(selectedWeek, 1))}
        className="shrink-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2 min-w-[200px] justify-center">
        <CalendarDays className="h-5 w-5 text-sky-600" />
        <span className="font-semibold text-slate-800">
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </span>
      </div>
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => onWeekChange(addWeeks(selectedWeek, 1))}
        className="shrink-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default React.memo(WeekSelector);