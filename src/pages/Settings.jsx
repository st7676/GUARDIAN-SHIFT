import React, { useState, useEffect } from 'react';
import { Client } from '@/api/Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bell, Save, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [localSettings, setLocalSettings] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    Client.auth.me().then(user => setCurrentUser(user)).catch(() => {});
  }, []);

  const { data: settings = [] } = useQuery({
    queryKey: ['userSettings', currentUser?.id],
    queryFn: () => Client.entities.UserSettings.filter({ user_id: currentUser.id }),
    enabled: !!currentUser
  });

  const currentSettings = settings[0];

  useEffect(() => {
    if (currentSettings) {
      setLocalSettings(currentSettings);
    } else if (currentUser) {
      setLocalSettings({
        user_id: currentUser.id,
        notify_schedule_ready: true,
        notify_before_morning_shift: false,
        notify_before_evening_shift: false,
        notify_before_night_shift: false,
        morning_notification_hours: 12,
        evening_notification_hours: 6,
        night_notification_hours: 8
      });
    }
  }, [currentSettings, currentUser]);

  const createSettingsMutation = useMutation({
    mutationFn: (data) => Client.entities.UserSettings.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      toast.success('ההגדרות נשמרו בהצלחה');
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: ({ id, data }) => Client.entities.UserSettings.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      toast.success('ההגדרות נשמרו בהצלחה');
    }
  });

  const handleSave = async () => {
    if (!localSettings) return;

    if (currentSettings?.id) {
      await updateSettingsMutation.mutateAsync({ 
        id: currentSettings.id, 
        data: localSettings 
      });
    } else {
      await createSettingsMutation.mutateAsync(localSettings);
    }
  };

  if (!currentUser || !localSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Clock className="w-12 h-12 text-slate-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">הגדרות</h1>
          <p className="text-slate-500 mt-1">נהל את העדפות ההתראות שלך</p>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-sky-600" />
                התראות כלליות
              </CardTitle>
              <CardDescription>התראות על סידורים ועדכונים</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="schedule-ready" className="flex-1">
                  <div className="font-medium">סידור מוכן</div>
                  <div className="text-sm text-slate-500">קבל התראה כאשר סידור חדש מתפרסם</div>
                </Label>
                <Switch
                  id="schedule-ready"
                  checked={localSettings.notify_schedule_ready}
                  onCheckedChange={(checked) => 
                    setLocalSettings({ ...localSettings, notify_schedule_ready: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-600" />
                תזכורות למשמרות
              </CardTitle>
              <CardDescription>קבל התראה לפני תחילת המשמרת</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="morning-notify" className="font-medium">
                    משמרת בוקר
                  </Label>
                  <Switch
                    id="morning-notify"
                    checked={localSettings.notify_before_morning_shift}
                    onCheckedChange={(checked) => 
                      setLocalSettings({ ...localSettings, notify_before_morning_shift: checked })
                    }
                  />
                </div>
                {localSettings.notify_before_morning_shift && (
                  <div className="mr-6">
                    <Label className="text-sm text-slate-600 mb-2 block">כמה שעות לפני?</Label>
                    <Select
                      value={String(localSettings.morning_notification_hours)}
                      onValueChange={(value) => 
                        setLocalSettings({ ...localSettings, morning_notification_hours: Number(value) })
                      }
                    >
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 6, 12, 24].map(hours => (
                          <SelectItem key={hours} value={String(hours)}>
                            {hours} שעות לפני
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="evening-notify" className="font-medium">
                    משמרת ערב
                  </Label>
                  <Switch
                    id="evening-notify"
                    checked={localSettings.notify_before_evening_shift}
                    onCheckedChange={(checked) => 
                      setLocalSettings({ ...localSettings, notify_before_evening_shift: checked })
                    }
                  />
                </div>
                {localSettings.notify_before_evening_shift && (
                  <div className="mr-6">
                    <Label className="text-sm text-slate-600 mb-2 block">כמה שעות לפני?</Label>
                    <Select
                      value={String(localSettings.evening_notification_hours)}
                      onValueChange={(value) => 
                        setLocalSettings({ ...localSettings, evening_notification_hours: Number(value) })
                      }
                    >
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 6, 12, 24].map(hours => (
                          <SelectItem key={hours} value={String(hours)}>
                            {hours} שעות לפני
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="night-notify" className="font-medium">
                    משמרת לילה
                  </Label>
                  <Switch
                    id="night-notify"
                    checked={localSettings.notify_before_night_shift}
                    onCheckedChange={(checked) => 
                      setLocalSettings({ ...localSettings, notify_before_night_shift: checked })
                    }
                  />
                </div>
                {localSettings.notify_before_night_shift && (
                  <div className="mr-6">
                    <Label className="text-sm text-slate-600 mb-2 block">כמה שעות לפני?</Label>
                    <Select
                      value={String(localSettings.night_notification_hours)}
                      onValueChange={(value) => 
                        setLocalSettings({ ...localSettings, night_notification_hours: Number(value) })
                      }
                    >
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 6, 12, 24].map(hours => (
                          <SelectItem key={hours} value={String(hours)}>
                            {hours} שעות לפני
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              size="lg"
              className="bg-sky-600 hover:bg-sky-700 gap-2 w-full md:w-auto"
            >
              <Save className="w-4 h-4" />
              שמור הגדרות
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}