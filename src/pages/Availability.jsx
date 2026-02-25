import React, { useState, useEffect } from 'react';
import { Client } from '@/api/Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfWeek, addWeeks, getDay, addDays } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import AvailabilityInputEnhanced from '@/components/scheduling/AvailabilityInputEnhanced';
import NurseCard from '@/components/scheduling/NurseCard';
import RequestWindowStatus from '@/components/scheduling/RequestWindowStatus';

export default function Availability() {
  const today = new Date();
  const currentWeek = startOfWeek(today, { weekStartsOn: 0 });
  const nextWeek = addWeeks(currentWeek, 1);
  const currentDayOfWeek = getDay(today);

  const [selectedNurse, setSelectedNurse] = useState(null);
  const [localAvailability, setLocalAvailability] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  const weekStartStr = format(nextWeek, 'yyyy-MM-dd');

  useEffect(() => {
    Client.auth.me().then(user => setCurrentUser(user)).catch(() => {});
  }, []);

  const { data: allNurses = [] } = useQuery({
    queryKey: ['nurses'],
    queryFn: () => Client.entities.Nurse.filter({ is_active: true })
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => Client.entities.Department.filter({ is_active: true })
  });

  const currentNurse = allNurses.find(n => (n.user_id && n.user_id === currentUser?.id) || n.id === currentUser?.id);
  const isHeadNurse = currentNurse?.is_head_nurse || false;
  const currentDepartment = departments.find(d => d.id === currentNurse?.department_id);

  const startDay = currentDepartment?.request_window_start_day ?? 0;
  const endDay = currentDepartment?.request_window_end_day ?? 3;
  const isWindowOpen = currentDayOfWeek >= startDay && currentDayOfWeek <= endDay;
  const canEdit = isHeadNurse || isWindowOpen;

  const nurses = isHeadNurse ? allNurses : allNurses.filter(n => n.id === currentNurse?.id);

  // Auto-select for regular nurse
  useEffect(() => {
    if (!isHeadNurse && currentNurse && !selectedNurse) {
      setSelectedNurse(currentNurse);
    }
  }, [currentNurse, isHeadNurse, selectedNurse]);

  const { data: availability = [] } = useQuery({
    queryKey: ['availability', weekStartStr],
    queryFn: () => Client.entities.NurseAvailability.filter({ week_start_date: weekStartStr })
  });

  const { data: weeklyStatuses = [] } = useQuery({
    queryKey: ['weeklyStatuses', weekStartStr],
    queryFn: () => Client.entities.NurseWeeklyStatus.filter({ week_start_date: weekStartStr })
  });

  // Also fetch persistent blocks
  const { data: persistentBlocks = [] } = useQuery({
    queryKey: ['persistentBlocks'],
    queryFn: () => Client.entities.NurseAvailability.filter({ is_persistent: true })
  });

  useEffect(() => {
    if (selectedNurse) {
      const nurseAvail = availability.filter(a => a.nurse_id === selectedNurse.id);
      const nursePersistent = persistentBlocks.filter(a => a.nurse_id === selectedNurse.id);
      
      // Combine week-specific and persistent blocks
      setLocalAvailability([...nurseAvail, ...nursePersistent]);
      setHasChanges(false);
    }
  }, [selectedNurse, availability, persistentBlocks]);

  const createAvailMutation = useMutation({
    mutationFn: (data) => Client.entities.NurseAvailability.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      queryClient.invalidateQueries({ queryKey: ['persistentBlocks'] });
    }
  });

  const updateAvailMutation = useMutation({
    mutationFn: ({ id, data }) => Client.entities.NurseAvailability.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      queryClient.invalidateQueries({ queryKey: ['persistentBlocks'] });
    }
  });

  const deleteAvailMutation = useMutation({
    mutationFn: (id) => Client.entities.NurseAvailability.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      queryClient.invalidateQueries({ queryKey: ['persistentBlocks'] });
    }
  });

  const handleAvailabilityChange = (newAvailability, specialRequest) => {
    setLocalAvailability(newAvailability.map(a => ({
      ...a,
      free_text_request: specialRequest,
      nurse_id: selectedNurse.id,
      week_start_date: a.is_persistent ? null : weekStartStr
    })));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedNurse) return;

    // Get existing entries for this specific nurse
    const nurseWeeklyAvail = availability.filter(a => a.nurse_id === selectedNurse.id);
    const nursePersistentAvail = persistentBlocks.filter(a => a.nurse_id === selectedNurse.id);
    const allExisting = [...nurseWeeklyAvail, ...nursePersistentAvail];

    // Build lookup for local availability
    const localLookup = {};
    localAvailability.forEach(avail => {
      const key = `${avail.day_of_week}-${avail.shift_type}-${avail.is_persistent ? 'p' : 'w'}`;
      localLookup[key] = avail;
    });

    // Delete entries that no longer exist in local
    for (const existing of allExisting) {
      const key = `${existing.day_of_week}-${existing.shift_type}-${existing.is_persistent ? 'p' : 'w'}`;
      if (!localLookup[key]) {
        await deleteAvailMutation.mutateAsync(existing.id);
      }
    }

    // Create or update entries
    for (const avail of localAvailability) {
      const matchingExisting = allExisting.find(
        ex => ex.day_of_week === avail.day_of_week &&
              ex.shift_type === avail.shift_type &&
              !!ex.is_persistent === !!avail.is_persistent
      );

      const data = {
        nurse_id: selectedNurse.id,
        week_start_date: avail.is_persistent ? undefined : weekStartStr,
        day_of_week: avail.day_of_week,
        shift_type: avail.shift_type,
        availability_type: avail.availability_type,
        is_persistent: avail.is_persistent || false,
        is_hidden_admin_block: avail.is_hidden_admin_block || false,
        free_text_request: avail.free_text_request
      };

      if (matchingExisting) {
        await updateAvailMutation.mutateAsync({ id: matchingExisting.id, data });
      } else {
        await createAvailMutation.mutateAsync(data);
      }
    }

    setHasChanges(false);
    queryClient.invalidateQueries();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                חזרה ללוח
              </Button>
            </Link>
            
            <div className="text-center">
              <div className="text-sm text-slate-500">זמינות עבור</div>
              <div className="font-bold text-slate-800">
                {format(nextWeek, 'dd/MM/yy')} - {format(addDays(nextWeek, 6), 'dd/MM/yy')}
              </div>
            </div>
            
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || !canEdit}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="w-4 h-4" />
              שמור שינויים
            </Button>
          </div>

          <RequestWindowStatus
            department={currentDepartment}
            isHeadNurse={isHeadNurse}
            currentDayOfWeek={currentDayOfWeek}
            targetWeekStart={nextWeek}
          />
        </div>

        <div className={`grid gap-6 ${isHeadNurse ? 'lg:grid-cols-3' : 'grid-cols-1'}`}>
          {/* Nurse List - Only show for Head Nurse */}
          {isHeadNurse && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-700">בחרי אחות</h2>
              <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pl-2">
                {nurses.map(nurse => {
                  const status = weeklyStatuses.find(ws => ws.nurse_id === nurse.id);
                  return (
                    <NurseCard
                      key={nurse.id}
                      nurse={nurse}
                      weeklyStatus={status}
                      onClick={setSelectedNurse}
                      selected={selectedNurse?.id === nurse.id}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Availability Grid */}
          <div className={isHeadNurse ? 'lg:col-span-2' : 'col-span-1'}>
            {selectedNurse ? (
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-sky-600" />
                      זמינות: {selectedNurse.full_name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <AvailabilityInputEnhanced
                    existingAvailability={localAvailability}
                    nurseShiftPreference={selectedNurse.shift_type_preference}
                    onAvailabilityChange={handleAvailabilityChange}
                    isReadOnly={!canEdit}
                    isHeadNurse={isHeadNurse}
                    showHiddenBlocks={isHeadNurse}
                  />
                </CardContent>
              </Card>
            ) : isHeadNurse ? (
              <Card className="border-0 shadow-lg h-full flex items-center justify-center">
                <CardContent className="text-center py-16">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">בחרי אחות כדי לערוך זמינות</p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}