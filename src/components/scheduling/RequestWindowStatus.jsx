import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Clock, Lock, CheckCircle2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export default function RequestWindowStatus({ 
  department, 
  isHeadNurse, 
  currentDayOfWeek,
  targetWeekStart 
}) {
  if (!department) return null;

  const startDay = department.request_window_start_day ?? 0;
  const endDay = department.request_window_end_day ?? 3;
  
  const isWindowOpen = currentDayOfWeek >= startDay && currentDayOfWeek <= endDay;
  const isBeforeWindow = currentDayOfWeek < startDay;
  const isAfterWindow = currentDayOfWeek > endDay;

  if (isHeadNurse) {
    return (
      <Alert className="bg-sky-50 border-sky-200">
        <CheckCircle2 className="h-4 w-4 text-sky-600" />
        <AlertDescription className="text-sky-800">
          <strong>אחות ראשית:</strong> את יכולה לערוך זמינות ובקשות בכל עת עד לנעילת הלוח
        </AlertDescription>
      </Alert>
    );
  }

  if (isWindowOpen) {
    return (
      <Alert className="bg-emerald-50 border-emerald-200">
        <Clock className="h-4 w-4 text-emerald-600" />
        <AlertDescription className="text-emerald-800">
          <strong>חלון הגשה פתוח</strong> - ניתן להגיש בקשות עד יום {DAY_NAMES[endDay]} השבוע
          <br />
          <span className="text-sm">הבקשות משפיעות על השבוע: {format(targetWeekStart, 'dd/MM/yy')}</span>
        </AlertDescription>
      </Alert>
    );
  }

  if (isBeforeWindow) {
    return (
      <Alert className="bg-amber-50 border-amber-200">
        <Calendar className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>חלון הגשה טרם נפתח</strong> - הגשת בקשות תיפתח ביום {DAY_NAMES[startDay]}
        </AlertDescription>
      </Alert>
    );
  }

  if (isAfterWindow) {
    return (
      <Alert className="bg-slate-50 border-slate-300">
        <Lock className="h-4 w-4 text-slate-600" />
        <AlertDescription className="text-slate-700">
          <strong>חלון הגשה נסגר</strong> - הבקשות לשבוע הבא נסגרו. המתיני לפתיחת החלון הבא
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}