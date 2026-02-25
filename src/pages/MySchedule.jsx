import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, startOfWeek, addWeeks, addDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock } from 'lucide-react';
import ScheduleGrid from '@/components/scheduling/ScheduleGrid';

export default function MySchedule() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentNurse, setCurrentNurse] = useState(null);
  
  const today = new Date();
  const currentWeek = startOfWeek(today, { weekStartsOn: 0 });
  const nextWeek = addWeeks(currentWeek, 1);

  useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => {});
  }, []);

  const { data: nurses = [] } = useQuery({
    queryKey: ['nurses'],
    queryFn: () => base44.entities.Nurse.filter({ is_active: true })
  });

  useEffect(() => {
    if (currentUser && nurses.length > 0) {
      const nurse = nurses.find(n => n.user_id === currentUser.id);
      setCurrentNurse(nurse);
    }
  }, [currentUser, nurses]);

  const currentWeekStr = format(currentWeek, 'yyyy-MM-dd');
  const nextWeekStr = format(nextWeek, 'yyyy-MM-dd');

  const { data: currentWeekAssignments = [] } = useQuery({
    queryKey: ['myAssignments', currentWeekStr],
    queryFn: () => base44.entities.ShiftAssignment.filter({ 
      week_start_date: currentWeekStr,
      nurse_id: currentNurse?.id 
    }),
    enabled: !!currentNurse
  });

  const { data: nextWeekAssignments = [] } = useQuery({
    queryKey: ['myAssignments', nextWeekStr],
    queryFn: () => base44.entities.ShiftAssignment.filter({ 
      week_start_date: nextWeekStr,
      nurse_id: currentNurse?.id 
    }),
    enabled: !!currentNurse
  });

  const { data: currentWeekSchedule = [] } = useQuery({
    queryKey: ['scheduleWeek', currentWeekStr],
    queryFn: () => base44.entities.ScheduleWeek.filter({ week_start_date: currentWeekStr })
  });

  const { data: nextWeekSchedule = [] } = useQuery({
    queryKey: ['scheduleWeek', nextWeekStr],
    queryFn: () => base44.entities.ScheduleWeek.filter({ week_start_date: nextWeekStr })
  });

  const { data: allCurrentWeekAssignments = [] } = useQuery({
    queryKey: ['allAssignments', currentWeekStr],
    queryFn: () => base44.entities.ShiftAssignment.filter({ week_start_date: currentWeekStr })
  });

  const { data: allNextWeekAssignments = [] } = useQuery({
    queryKey: ['allAssignments', nextWeekStr],
    queryFn: () => base44.entities.ShiftAssignment.filter({ week_start_date: nextWeekStr })
  });

  if (!currentUser || nurses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-spin" />
          <p className="text-slate-500">טוען...</p>
        </div>
      </div>
    );
  }

  if (!currentNurse) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" dir="rtl">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">לא נמצא פרופיל</h2>
            <p className="text-slate-500">המשתמש לא משויך לאחות במערכת</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">המשמרות שלי</h1>
          <p className="text-slate-500 mt-1">{currentNurse.full_name}</p>
        </div>

        <Tabs defaultValue="current" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="current">שבוע נוכחי</TabsTrigger>
            <TabsTrigger value="next">שבוע הבא</TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  המשמרות שלי - {format(currentWeek, 'dd/MM/yy')} עד {format(addDays(currentWeek, 6), 'dd/MM/yy')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {currentWeekAssignments.length > 0 ? (
                  <div className="space-y-3">
                    {currentWeekAssignments.map(assignment => {
                      const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
                      const shiftNames = { morning: 'בוקר', evening: 'ערב', night: 'לילה' };
                      const roleNames = { responsible: 'אחראית', monitoring: 'מפקחת', staff: 'צוות' };
                      
                      return (
                        <div key={assignment.id} className="p-4 bg-sky-50 rounded-lg border border-sky-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-slate-800">
                                {dayNames[assignment.day_of_week]} - {shiftNames[assignment.shift_type]}
                              </div>
                              <div className="text-sm text-slate-600">
                                תפקיד: {roleNames[assignment.role]}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">אין משמרות מוקצות</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg mt-6">
              <CardHeader className="border-b">
                <CardTitle>לוח המשמרות המלא - מחלקה</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ScheduleGrid 
                  assignments={allCurrentWeekAssignments}
                  nurses={nurses}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="next">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  המשמרות שלי - {format(nextWeek, 'dd/MM/yy')} עד {format(addDays(nextWeek, 6), 'dd/MM/yy')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {nextWeekSchedule[0]?.status === 'published' ? (
                  nextWeekAssignments.length > 0 ? (
                    <div className="space-y-3">
                      {nextWeekAssignments.map(assignment => {
                        const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
                        const shiftNames = { morning: 'בוקר', evening: 'ערב', night: 'לילה' };
                        const roleNames = { responsible: 'אחראית', monitoring: 'מפקחת', staff: 'צוות' };
                        
                        return (
                          <div key={assignment.id} className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-slate-800">
                                  {dayNames[assignment.day_of_week]} - {shiftNames[assignment.shift_type]}
                                </div>
                                <div className="text-sm text-slate-600">
                                  תפקיד: {roleNames[assignment.role]}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8">אין משמרות מוקצות</p>
                  )
                ) : (
                  <p className="text-center text-slate-500 py-8">הלוח לשבוע הבא טרם פורסם</p>
                )}
              </CardContent>
            </Card>

            {nextWeekSchedule[0]?.status === 'published' && (
              <Card className="border-0 shadow-lg mt-6">
                <CardHeader className="border-b">
                  <CardTitle>לוח המשמרות המלא - מחלקה</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ScheduleGrid 
                    assignments={allNextWeekAssignments}
                    nurses={nurses}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}