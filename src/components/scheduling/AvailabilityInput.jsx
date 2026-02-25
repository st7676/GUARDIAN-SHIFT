import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Star, Check, X, AlertCircle } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHIFTS = ['morning', 'evening', 'night'];
const SHIFT_LABELS = { morning: 'M', evening: 'E', night: 'N' };

const availabilityColors = {
  preferred: 'bg-amber-400 text-white border-amber-500',
  available: 'bg-emerald-400 text-white border-emerald-500',
  avoid: 'bg-orange-300 text-orange-800 border-orange-400',
  blocked: 'bg-red-500 text-white border-red-600',
  none: 'bg-slate-100 text-slate-400 border-slate-200'
};

const availabilityIcons = {
  preferred: Star,
  available: Check,
  avoid: AlertCircle,
  blocked: X
};

const cycleOrder = ['none', 'preferred', 'available', 'avoid', 'blocked'];

export default function AvailabilityInput({ 
  availability, 
  onAvailabilityChange, 
  freeTextRequest,
  onFreeTextChange,
  nurseShiftPreference 
}) {
  const [matrix, setMatrix] = useState(() => {
    const initial = {};
    DAYS.forEach((_, dayIdx) => {
      SHIFTS.forEach(shift => {
        const key = `${dayIdx}-${shift}`;
        const existing = availability?.find(a => a.day_of_week === dayIdx && a.shift_type === shift);
        initial[key] = existing?.availability_type || 'none';
      });
    });
    return initial;
  });

  const handleCellClick = (dayIdx, shift) => {
    const key = `${dayIdx}-${shift}`;
    const currentIdx = cycleOrder.indexOf(matrix[key]);
    const nextIdx = (currentIdx + 1) % cycleOrder.length;
    const newValue = cycleOrder[nextIdx];
    
    const newMatrix = { ...matrix, [key]: newValue };
    setMatrix(newMatrix);
    
    onAvailabilityChange?.(dayIdx, shift, newValue);
  };

  const isShiftBlocked = (shift) => {
    if (nurseShiftPreference === 'no_nights' && shift === 'night') return true;
    if (nurseShiftPreference === 'morning_only' && shift !== 'morning') return true;
    if (nurseShiftPreference === 'evening_only' && shift !== 'evening') return true;
    if (nurseShiftPreference === 'night_only' && shift !== 'night') return true;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-sm">
        {cycleOrder.filter(t => t !== 'none').map(type => {
          const Icon = availabilityIcons[type];
          return (
            <div key={type} className="flex items-center gap-1.5">
              <div className={cn("w-6 h-6 rounded flex items-center justify-center border", availabilityColors[type])}>
                <Icon className="w-3 h-3" />
              </div>
              <span className="capitalize text-slate-600">{type}</span>
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[400px]">
          <div className="grid grid-cols-8 gap-1 mb-2">
            <div></div>
            {DAYS.map((day, i) => (
              <div 
                key={day} 
                className={cn(
                  "text-center text-sm font-semibold py-2 rounded",
                  i === 5 || i === 6 ? "bg-sky-100 text-sky-700" : "text-slate-600"
                )}
              >
                {day}
              </div>
            ))}
          </div>
          
          {SHIFTS.map(shift => (
            <div key={shift} className="grid grid-cols-8 gap-1 mb-1">
              <div className="flex items-center text-sm font-medium text-slate-600 capitalize">
                {shift}
              </div>
              {DAYS.map((_, dayIdx) => {
                const key = `${dayIdx}-${shift}`;
                const value = matrix[key];
                const Icon = availabilityIcons[value];
                const blocked = isShiftBlocked(shift);
                
                return (
                  <button
                    key={key}
                    onClick={() => !blocked && handleCellClick(dayIdx, shift)}
                    disabled={blocked}
                    className={cn(
                      "h-12 rounded-lg border-2 flex items-center justify-center transition-all",
                      blocked ? "bg-slate-200 cursor-not-allowed opacity-50" : "hover:scale-105 cursor-pointer",
                      availabilityColors[value]
                    )}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Free text request */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Special Requests
        </label>
        <Textarea
          placeholder="Any special scheduling requests for this week..."
          value={freeTextRequest || ''}
          onChange={(e) => onFreeTextChange?.(e.target.value)}
          className="min-h-[80px]"
        />
      </div>
    </div>
  );
}