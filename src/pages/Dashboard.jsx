import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfWeek, addDays } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, BarChart3, Settings, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import ScheduleGrid from '@/components/scheduling/ScheduleGrid';
import StaffingStats from '@/components/scheduling/StaffingStats';
import WeekSelector from '@/components/scheduling/WeekSelector';
import ScheduleGenerator from '@/components/scheduling/ScheduleGenerator';
import ShiftEditDialog from '@/components/scheduling/ShiftEditDialog';
import { generateSchedule, calculateSupplyDemand, calculateRequiredStaffing } from '@/components/scheduling/SchedulingEngine';
import { toast } from 'sonner';

export default function Dashboard() {
  const today = new Date();
  const currentWeek = startOfWeek(today, { weekStartsOn: 0 });
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingShift, setEditingShift] = useState(null);
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const weekStartStr = format(selectedWeek, 'yyyy-MM-dd');

  useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => {});
  }, []);

  const { data: nurses = [] } = useQuery({
    queryKey: ['nurses'],
    queryFn: () => base44.entities.Nurse.filter({ is_active: true })
  });

  const currentNurse = nurses.find(n => n.user_id === currentUser?.id);
  const isHeadNurse = currentNurse?.is_head_nurse || false;

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => base44.entities.Department.filter({ is_active: true })
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments', weekStartStr],
    queryFn: () => base44.entities.ShiftAssignment.filter({ week_start_date: weekStartStr })
  });

  const { data: weeklyStatuses = [] } = useQuery({
    queryKey: ['weeklyStatuses', weekStartStr],
    queryFn: () => base44.entities.NurseWeeklyStatus.filter({ week_start_date: weekStartStr })
  });

  const { data: availability = [] } = useQuery({
    queryKey: ['availability', weekStartStr],
    queryFn: () => base44.entities.NurseAvailability.filter({ week_start_date: weekStartStr })
  });

  const { data: scheduleWeeks = [] } = useQuery({
    queryKey: ['scheduleWeeks', weekStartStr],
    queryFn: () => base44.entities.ScheduleWeek.filter({ week_start_date: weekStartStr })
  });

  const currentDepartment = departments[0];
  const currentScheduleWeek = scheduleWeeks[0];

  const createAssignmentMutation = useMutation({
    mutationFn: (data) => base44.entities.ShiftAssignment.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments'] })
  });

  const createScheduleWeekMutation = useMutation({
    mutationFn: (data) => base44.entities.ScheduleWeek.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduleWeeks'] })
  });

  const deleteAssignmentsMutation = useMutation({
    mutationFn: async (ids) => {
      for (const id of ids) {
        await base44.entities.ShiftAssignment.delete(id);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments'] })
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShiftAssignment.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments'] })
  });

  const updateScheduleWeekMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ScheduleWeek.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduleWeeks'] })
  });

  const supplyDemand = currentDepartment ? 
    calculateSupplyDemand(nurses, weeklyStatuses, calculateRequiredStaffing(currentDepartment)) : 
    null;

  const handleGenerate = async () => {
    if (!currentDepartment || !isHeadNurse) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);

    // Delete existing assignments for this week
    if (assignments.length > 0) {
      await deleteAssignmentsMutation.mutateAsync(assignments.map(a => a.id));
    }

    // Generate new schedule
    const result = generateSchedule(
      nurses, 
      weeklyStatuses, 
      availability, 
      currentDepartment,
      setGenerationProgress
    );

    // Save assignments
    for (const assignment of result.assignments) {
      await createAssignmentMutation.mutateAsync({
        ...assignment,
        week_start_date: weekStartStr
      });
    }

    // Save or update schedule week as GENERATED (not published)
    await createScheduleWeekMutation.mutateAsync({
      department_id: currentDepartment.id,
      week_start_date: weekStartStr,
      status: 'generated',
      total_shifts_required: supplyDemand?.required || 0,
      total_shifts_available: supplyDemand?.available || 0,
      shortage_mode: result.isShortageMode,
      overstaffing_mode: result.isOverstaffingMode,
      constraint_violations: result.violations,
      fairness_score: result.fairnessScore,
      generated_at: new Date().toISOString()
    });

    setIsGenerating(false);
    queryClient.invalidateQueries();
    toast.success('הלוח נוצר בהצלחה');
  };

  const handlePublishSchedule = async () => {
    if (!currentScheduleWeek || !isHeadNurse) return;

    await base44.entities.ScheduleWeek.update(currentScheduleWeek.id, {
      status: 'published',
      published_at: new Date().toISOString()
    });

    // Create notifications for all nurses
    for (const nurse of nurses) {
      if (nurse.user_id) {
        await base44.entities.Notification.create({
          user_id: nurse.user_id,
          title: 'הסידור מוכן',
          message: `הסידור לשבוע ${format(selectedWeek, 'dd/MM/yy')} פורסם`,
          type: 'schedule_ready',
          link_page: 'MySchedule',
          sent_at: new Date().toISOString()
        });
      }
    }

    queryClient.invalidateQueries();
    toast.success('הלוח פורסם לכל האחיות!');
  };

  const handleCellClick = (day, shift) => {
    if (!isHeadNurse) return;
    
    const shiftAssignments = assignments.filter(
      a => a.day_of_week === day && a.shift_type === shift
    ).map(a => ({
      ...a,
      nurse: nurses.find(n => n.id === a.nurse_id)
    }));

    setEditingShift({ day, type: shift });
    setShiftDialogOpen(true);
  };

  const handleSaveShiftEdit = async (newAssignments) => {
    const existingIds = assignments
      .filter(a => a.day_of_week === editingShift.day && a.shift_type === editingShift.type)
      .map(a => a.id);

    // Delete old assignments
    for (const id of existingIds) {
      await base44.entities.ShiftAssignment.delete(id);
    }

    // Create new assignments
    for (const assignment of newAssignments) {
      if (!assignment._isNew && assignment.id && !assignment.id.startsWith('temp-')) {
        continue;
      }
      
      await createAssignmentMutation.mutateAsync({
        nurse_id: assignment.nurse_id,
        department_id: currentDepartment.id,
        week_start_date: weekStartStr,
        day_of_week: editingShift.day,
        shift_type: editingShift.type,
        role: assignment.role,
        status: 'scheduled'
      });
    }

    // Ensure ScheduleWeek exists with 'generated' status
    if (!currentScheduleWeek) {
      await createScheduleWeekMutation.mutateAsync({
        department_id: currentDepartment.id,
        week_start_date: weekStartStr,
        status: 'generated',
        total_shifts_required: supplyDemand?.required || 0,
        total_shifts_available: supplyDemand?.available || 0,
        generated_at: new Date().toISOString()
      });
    } else if (currentScheduleWeek.status === 'draft') {
      await base44.entities.ScheduleWeek.update(currentScheduleWeek.id, {
        status: 'generated',
        generated_at: new Date().toISOString()
      });
    }

    queryClient.invalidateQueries({ queryKey: ['assignments'] });
    queryClient.invalidateQueries({ queryKey: ['scheduleWeeks'] });
    toast.success('המשמרת עודכנה');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-[1600px] mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Shift Scheduler</h1>
              <p className="text-slate-500 mt-1">
                {currentDepartment?.name || 'No department selected'}
              </p>
            </div>
            
            <WeekSelector selectedWeek={selectedWeek} onWeekChange={setSelectedWeek} />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-4 md:gap-6">
          {/* Schedule Grid */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-white/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-sky-600" />
                    Weekly Schedule
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {isHeadNurse && assignments.length > 0 && (
                      <>
                        {currentScheduleWeek?.status === 'published' ? (
                          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            פורסם
                          </span>
                        ) : (
                          <Button 
                            onClick={handlePublishSchedule}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            פרסם לוח סידור
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <ScheduleGrid 
                  assignments={assignments}
                  nurses={nurses}
                  onCellClick={isHeadNurse ? handleCellClick : undefined}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 md:space-y-6">
            {isHeadNurse && (
              <ScheduleGenerator
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                generationProgress={generationProgress}
                supplyDemandBalance={supplyDemand}
                validationWarnings={currentScheduleWeek?.constraint_violations}
              />
            )}
          </div>
        </div>

        {/* Shift Edit Dialog */}
        {isHeadNurse && (
          <ShiftEditDialog
            open={shiftDialogOpen}
            onClose={() => setShiftDialogOpen(false)}
            shift={editingShift}
            currentAssignments={editingShift ? assignments.filter(
              a => a.day_of_week === editingShift.day && a.shift_type === editingShift.type
            ).map(a => ({
              ...a,
              nurse: nurses.find(n => n.id === a.nurse_id)
            })) : []}
            availableNurses={nurses}
            onSave={handleSaveShiftEdit}
          />
        )}
      </div>
    </div>
  );
}