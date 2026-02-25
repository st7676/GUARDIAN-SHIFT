import React, { useState } from 'react';
import { Client } from '@/api/Client';
import { useQuery } from '@tanstack/react-query';
import { format, startOfWeek, subWeeks } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, Users, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import WeekSelector from '@/components/scheduling/WeekSelector';

const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#6366f1'];

export default function Reports() {
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const weekStartStr = format(selectedWeek, 'yyyy-MM-dd');

  const { data: nurses = [] } = useQuery({
    queryKey: ['nurses'],
    queryFn: () => Client.entities.Nurse.filter({ is_active: true })
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments', weekStartStr],
    queryFn: () => Client.entities.ShiftAssignment.filter({ week_start_date: weekStartStr })
  });

  const { data: scheduleWeek } = useQuery({
    queryKey: ['scheduleWeek', weekStartStr],
    queryFn: async () => {
      const weeks = await Client.entities.ScheduleWeek.filter({ week_start_date: weekStartStr });
      return weeks[0];
    }
  });

  // Calculate stats
  const shiftsPerNurse = nurses.map(nurse => ({
    name: nurse.full_name?.split(' ')[0] || 'Unknown',
    shifts: assignments.filter(a => a.nurse_id === nurse.id).length,
    quota: nurse.employment_percentage === 100 ? 4.5 : 
           nurse.employment_percentage === 88 ? 4 :
           nurse.employment_percentage === 76 ? 3.5 : 3
  })).sort((a, b) => b.shifts - a.shifts);

  const roleDistribution = [
    { name: 'Staff', value: assignments.filter(a => a.role === 'staff').length },
    { name: 'Responsible', value: assignments.filter(a => a.role === 'responsible').length },
    { name: 'Monitoring', value: assignments.filter(a => a.role === 'monitoring').length }
  ];

  const shiftTypeDistribution = [
    { name: 'Morning', value: assignments.filter(a => a.shift_type === 'morning').length },
    { name: 'Evening', value: assignments.filter(a => a.shift_type === 'evening').length },
    { name: 'Night', value: assignments.filter(a => a.shift_type === 'night').length }
  ];

  const problematicCount = assignments.filter(a => a.is_problematic).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Reports</h1>
              <p className="text-slate-500">Schedule analytics and insights</p>
            </div>
          </div>
          <WeekSelector selectedWeek={selectedWeek} onWeekChange={setSelectedWeek} />
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Total Shifts</p>
                  <p className="text-2xl font-bold text-slate-800">{assignments.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-sky-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Nurses Scheduled</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {new Set(assignments.map(a => a.nurse_id)).size}
                  </p>
                </div>
                <Users className="w-8 h-8 text-violet-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Fairness Score</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {scheduleWeek?.fairness_score || '-'}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Issues</p>
                  <p className={`text-2xl font-bold ${problematicCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {problematicCount}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6">
          {/* Shifts per Nurse */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Shifts per Nurse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] overflow-y-auto">
                <ResponsiveContainer width="100%" height={Math.max(600, shiftsPerNurse.length * 40)}>
                  <BarChart data={shiftsPerNurse} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 6]} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="shifts" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="quota" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Constraint Violations */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Constraint Issues</CardTitle>
            </CardHeader>
            <CardContent>
              {scheduleWeek?.constraint_violations?.length > 0 ? (
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {scheduleWeek.constraint_violations.map((violation, idx) => (
                    <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                      {violation}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-slate-400">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 text-emerald-400" />
                    <p>No constraint violations</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}