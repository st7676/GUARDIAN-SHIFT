import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

function StaffingStats({ scheduleWeek, assignments, nurses }) {
  const totalAssigned = assignments?.length || 0;
  const totalRequired = scheduleWeek?.total_shifts_required || 0;
  const coverage = React.useMemo(
    () => totalRequired > 0 ? Math.round((totalAssigned / totalRequired) * 100) : 0,
    [totalAssigned, totalRequired]
  );

  const problematicShifts = React.useMemo(
    () => assignments?.filter(a => a.is_problematic).length || 0,
    [assignments]
  );

  const uniqueNursesScheduled = React.useMemo(
    () => new Set(assignments?.map(a => a.nurse_id)).size,
    [assignments]
  );
  
  const stats = [
    {
      label: 'Total Coverage',
      value: `${coverage}%`,
      subtext: `${totalAssigned}/${totalRequired} shifts`,
      icon: Calendar,
      color: coverage >= 100 ? 'text-emerald-600' : coverage >= 80 ? 'text-amber-600' : 'text-red-600',
      bgColor: coverage >= 100 ? 'bg-emerald-100' : coverage >= 80 ? 'bg-amber-100' : 'bg-red-100'
    },
    {
      label: 'Nurses Scheduled',
      value: uniqueNursesScheduled,
      subtext: `of ${nurses?.length || 0} total`,
      icon: Users,
      color: 'text-sky-600',
      bgColor: 'bg-sky-100'
    },
    {
      label: 'Constraint Issues',
      value: problematicShifts,
      subtext: problematicShifts === 0 ? 'All clear' : 'Need review',
      icon: problematicShifts === 0 ? CheckCircle : AlertTriangle,
      color: problematicShifts === 0 ? 'text-emerald-600' : 'text-red-600',
      bgColor: problematicShifts === 0 ? 'bg-emerald-100' : 'bg-red-100'
    },
    {
      label: 'Fairness Score',
      value: scheduleWeek?.fairness_score || '-',
      subtext: 'Distribution quality',
      icon: CheckCircle,
      color: 'text-violet-600',
      bgColor: 'bg-violet-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <Card key={idx} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">{stat.label}</p>
                <p className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.subtext}</p>
              </div>
              <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default React.memo(StaffingStats);