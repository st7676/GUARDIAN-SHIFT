import React, { useState, useEffect } from 'react';
import { Client } from '@/api/Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfWeek, addWeeks, addDays } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertCircle, Eye, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdminReview() {
  const [reviewedNotes, setReviewedNotes] = useState(new Set());
  const queryClient = useQueryClient();
  
  const today = new Date();
  const nextWeek = addWeeks(startOfWeek(today, { weekStartsOn: 0 }), 1);
  const weekStartStr = format(nextWeek, 'yyyy-MM-dd');

  const { data: nurses = [] } = useQuery({
    queryKey: ['nurses'],
    queryFn: () => Client.entities.Nurse.filter({ is_active: true })
  });

  const { data: availability = [] } = useQuery({
    queryKey: ['availability', weekStartStr],
    queryFn: () => Client.entities.NurseAvailability.filter({ week_start_date: weekStartStr })
  });

  const { data: scheduleWeeks = [] } = useQuery({
    queryKey: ['scheduleWeeks', weekStartStr],
    queryFn: () => Client.entities.ScheduleWeek.filter({ week_start_date: weekStartStr })
  });

  const currentScheduleWeek = scheduleWeeks[0];

  // Get all nurses with notes
  const nursesWithNotes = nurses.filter(nurse => {
    const nurseAvail = availability.filter(a => a.nurse_id === nurse.id);
    const hasNote = nurseAvail.some(a => a.free_text_request);
    return hasNote;
  }).map(nurse => {
    const nurseAvail = availability.filter(a => a.nurse_id === nurse.id);
    const note = nurseAvail.find(a => a.free_text_request)?.free_text_request || '';
    return { ...nurse, note };
  });

  const allNotesReviewed = nursesWithNotes.length > 0 && 
    nursesWithNotes.every(n => reviewedNotes.has(n.id));

  const toggleReviewed = (nurseId) => {
    setReviewedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nurseId)) {
        newSet.delete(nurseId);
      } else {
        newSet.add(nurseId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">סקירת בקשות</h1>
          <p className="text-slate-500 mt-1">
            סקור את כל הבקשות והערות לפני יצירת הלוח - שבוע {format(nextWeek, 'dd/MM/yy')}
          </p>
        </div>

        {currentScheduleWeek?.status === 'requests_closed' ? (
          <>
            <Card className="border-0 shadow-lg mb-6">
              <CardHeader className="border-b bg-amber-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    בקשות והערות מהאחיות
                  </CardTitle>
                  <Badge variant="outline" className="bg-white">
                    {reviewedNotes.size} / {nursesWithNotes.length} נסקרו
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {nursesWithNotes.length > 0 ? (
                  <div className="space-y-4">
                    {nursesWithNotes.map(nurse => (
                      <Card key={nurse.id} className={reviewedNotes.has(nurse.id) ? 'bg-emerald-50' : 'bg-white'}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-slate-800">{nurse.full_name}</span>
                                {reviewedNotes.has(nurse.id) && (
                                  <Badge className="bg-emerald-600 text-white gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    נסקר
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                                {nurse.note}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Link to={createPageUrl('Availability')}>
                                <Button size="sm" variant="outline" className="gap-1">
                                  <Edit3 className="w-3 h-3" />
                                  ערוך
                                </Button>
                              </Link>
                              <Button 
                                size="sm" 
                                variant={reviewedNotes.has(nurse.id) ? "secondary" : "default"}
                                onClick={() => toggleReviewed(nurse.id)}
                                className="gap-1"
                              >
                                {reviewedNotes.has(nurse.id) ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3" />
                                    נסקר
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-3 h-3" />
                                    סמן כנסקר
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">אין בקשות או הערות לסקירה</p>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-center gap-4">
              <Link to={createPageUrl('Availability')}>
                <Button variant="outline" size="lg">
                  חזור לעריכת זמינות
                </Button>
              </Link>
              <Link to={createPageUrl('Dashboard')}>
                <Button 
                  size="lg" 
                  disabled={nursesWithNotes.length > 0 && !allNotesReviewed}
                  className="bg-sky-600 hover:bg-sky-700"
                >
                  המשך ליצירת לוח
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">חלון הבקשות עדיין פתוח או שהלוח כבר נוצר</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}