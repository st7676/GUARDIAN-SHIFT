import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User, Shield, Eye, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHIFTS = ['morning', 'evening', 'night'];
const SHIFT_TIMES = {
  morning: '07:00-15:00',
  evening: '15:00-23:00',
  night: '23:00-07:00'
};

const roleIcons = {
  responsible: Shield,
  monitoring: Eye,
  staff: User
};

const roleColors = {
  responsible: 'bg-violet-100 text-violet-700 border-violet-200',
  monitoring: 'bg-amber-100 text-amber-700 border-amber-200',
  staff: 'bg-slate-100 text-slate-600 border-slate-200'
};

export default function ScheduleGrid({ assignments, nurses, onCellClick, isShabbatShift }) {
  const getAssignmentsForCell = (dayIndex, shiftType) => {
    return assignments.filter(a => a.day_of_week === dayIndex && a.shift_type === shiftType);
  };

  const getNurse = (nurseId) => nurses.find(n => n.id === nurseId);

  const isShabbat = (dayIndex, shiftType) => {
    if (dayIndex === 5 && shiftType === 'evening') return true;
    if (dayIndex === 5 && shiftType === 'night') return true;
    if (dayIndex === 6 && shiftType === 'morning') return true;
    if (dayIndex === 6 && shiftType === 'evening') return true;
    return false;
  };

  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Header */}
          <div className="grid grid-cols-8 gap-1 mb-2">
            <div className="p-3 font-medium text-slate-500 text-sm">Shift</div>
            {DAYS.map((day, i) => (
              <div 
                key={day} 
                className={cn(
                  "p-3 text-center font-semibold text-sm rounded-lg",
                  i === 5 || i === 6 ? "bg-sky-50 text-sky-700" : "bg-slate-50 text-slate-700"
                )}
              >
                {day.slice(0, 3)}
              </div>
            ))}
          </div>

          {/* Grid */}
          {SHIFTS.map(shift => (
            <div key={shift} className="grid grid-cols-8 gap-1 mb-1">
              <div className="p-3 flex flex-col justify-center">
                <span className="font-medium text-slate-700 capitalize">{shift}</span>
                <span className="text-xs text-slate-400">{SHIFT_TIMES[shift]}</span>
              </div>
              {DAYS.map((_, dayIndex) => {
                const cellAssignments = getAssignmentsForCell(dayIndex, shift);
                const shabbat = isShabbat(dayIndex, shift);
                
                return (
                  <div
                    key={`${dayIndex}-${shift}`}
                    onClick={() => onCellClick?.(dayIndex, shift)}
                    className={cn(
                      "min-h-[120px] p-2 rounded-lg border transition-all cursor-pointer hover:shadow-md",
                      shabbat ? "bg-sky-50/50 border-sky-200" : "bg-white border-slate-200",
                      "hover:border-sky-400"
                    )}
                  >
                    <div className="space-y-1">
                      {cellAssignments.map((assignment, idx) => {
                        const nurse = getNurse(assignment.nurse_id);
                        const RoleIcon = roleIcons[assignment.role];
                        
                        return (
                          <Tooltip key={idx}>
                            <TooltipTrigger asChild>
                              <div className={cn(
                                "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border",
                                roleColors[assignment.role],
                                assignment.is_problematic && "ring-2 ring-red-300"
                              )}>
                                <RoleIcon className="w-3 h-3 shrink-0" />
                                <span className="truncate font-medium">
                                  {nurse?.full_name?.split(' ')[0] || 'Unknown'}
                                </span>
                                {assignment.is_problematic && (
                                  <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-sm">
                                <p className="font-semibold">{nurse?.full_name}</p>
                                <p className="text-slate-400 capitalize">{assignment.role}</p>
                                {assignment.violation_notes && (
                                  <p className="text-red-400 mt-1">{assignment.violation_notes}</p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}