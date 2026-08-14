import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Moon, Sun, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";

const gradeColors = {
  1: 'bg-emerald-100 text-emerald-700',
  2: 'bg-sky-100 text-sky-700',
  3: 'bg-amber-100 text-amber-700',
  4: 'bg-rose-100 text-rose-700'
};

const shiftPreferenceIcons = {
  morning_only: Sun,
  evening_only: Clock,
  night_only: Moon,
  no_nights: Moon,
  any: null
};

function NurseCard({ nurse, weeklyStatus, onClick, selected }) {
  const initials = nurse.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2);
  const PreferenceIcon = shiftPreferenceIcons[nurse.shift_type_preference];
  
  return (
    <div 
      onClick={() => onClick?.(nurse)}
      className={cn(
        "p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg bg-white",
        selected ? "border-sky-500 ring-2 ring-sky-200 shadow-lg" : "border-slate-200 hover:border-sky-300"
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={nurse.photo_url} />
          <AvatarFallback className="bg-gradient-to-br from-sky-400 to-indigo-500 text-white font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800 truncate">{nurse.full_name}</h3>
            {nurse.is_shabbat_anchor && (
              <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="secondary" className={cn("text-xs", gradeColors[nurse.grade])}>
              Grade {nurse.grade}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {nurse.employment_percentage}%
            </Badge>
            {PreferenceIcon && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <PreferenceIcon className="w-3 h-3" />
                {nurse.shift_type_preference === 'no_nights' ? 'No nights' : nurse.shift_type_preference.replace('_', ' ')}
              </Badge>
            )}
          </div>
          
          <div className="mt-2 text-xs text-slate-500">
            <span>{nurse.experience_years} yrs exp</span>
            <span className="mx-2">•</span>
            <span>Score: {nurse.responsibility_score}/10</span>
          </div>
          
          {weeklyStatus && (
            <div className="mt-2 flex items-center gap-2">
              <div className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                weeklyStatus.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                weeklyStatus.status === 'vacation' ? 'bg-purple-100 text-purple-700' :
                'bg-slate-100 text-slate-600'
              )}>
                {weeklyStatus.status.replace('_', ' ')}
              </div>
              <span className="text-xs text-slate-400">
                {weeklyStatus.assigned_shifts || 0}/{weeklyStatus.target_shifts || '-'} shifts
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(NurseCard);