import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, UserMinus, UserPlus, Save } from 'lucide-react';

export default function ShiftEditDialog({ 
  open, 
  onClose, 
  shift, 
  currentAssignments, 
  availableNurses,
  onSave 
}) {
  const [assignments, setAssignments] = useState(currentAssignments || []);
  const [warnings, setWarnings] = useState([]);
  const [selectedNurse, setSelectedNurse] = useState('');
  const [selectedRole, setSelectedRole] = useState('staff');

  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const shiftNames = { morning: 'בוקר', evening: 'ערב', night: 'לילה' };
  const roleNames = { responsible: 'אחראית', monitoring: 'מפקחת', staff: 'צוות' };

  const removeAssignment = (assignmentId) => {
    const newAssignments = assignments.filter(a => a.id !== assignmentId);
    setAssignments(newAssignments);
    validateAssignments(newAssignments);
  };

  const addAssignment = () => {
    if (!selectedNurse) return;

    const nurse = availableNurses.find(n => n.id === selectedNurse);
    const newAssignment = {
      id: `temp-${Date.now()}`,
      nurse_id: selectedNurse,
      nurse,
      role: selectedRole,
      day_of_week: shift.day,
      shift_type: shift.type,
      _isNew: true
    };

    const newAssignments = [...assignments, newAssignment];
    setAssignments(newAssignments);
    validateAssignments(newAssignments);
    setSelectedNurse('');
  };

  const validateAssignments = (currentAssignments) => {
    const newWarnings = [];
    
    // Check minimum staffing
    const staffCount = currentAssignments.length;
    if (staffCount < 5) {
      newWarnings.push(`מספר אחיות נמוך מהמינימום: ${staffCount}/5`);
    }

    // Check roles
    const hasResponsible = currentAssignments.some(a => a.role === 'responsible');
    const hasMonitoring = currentAssignments.some(a => a.role === 'monitoring');
    
    if (!hasResponsible) {
      newWarnings.push('אין אחראית במשמרת');
    }
    if (!hasMonitoring) {
      newWarnings.push('אין מפקחת במשמרת');
    }

    setWarnings(newWarnings);
  };

  const handleSave = () => {
    onSave(assignments);
    onClose();
  };

  if (!shift) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            עריכת משמרת - {dayNames[shift.day]} {shiftNames[shift.type]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-800 mb-1">אזהרות:</div>
                  <ul className="text-sm text-amber-700 space-y-1">
                    {warnings.map((warning, idx) => (
                      <li key={idx}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Current Assignments */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-3">אחיות במשמרת ({assignments.length})</h3>
            <div className="space-y-2">
              {assignments.map(assignment => (
                <div key={assignment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{assignment.nurse?.full_name}</span>
                    <Badge variant="outline">{roleNames[assignment.role]}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAssignment(assignment.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {assignments.length === 0 && (
                <p className="text-center text-slate-500 py-4">אין אחיות במשמרת</p>
              )}
            </div>
          </div>

          {/* Add Assignment */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-3">הוסף אחות</h3>
            <div className="flex gap-2">
              <Select value={selectedNurse} onValueChange={setSelectedNurse}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="בחר אחות" />
                </SelectTrigger>
                <SelectContent>
                  {availableNurses
                    .filter(n => !assignments.some(a => a.nurse_id === n.id))
                    .map(nurse => (
                      <SelectItem key={nurse.id} value={nurse.id}>
                        {nurse.full_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">צוות</SelectItem>
                  <SelectItem value="monitoring">מפקחת</SelectItem>
                  <SelectItem value="responsible">אחראית</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={addAssignment}
                disabled={!selectedNurse}
                className="bg-sky-600 hover:bg-sky-700"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            ביטול
          </Button>
          <Button onClick={handleSave} className="bg-sky-600 hover:bg-sky-700 gap-2">
            <Save className="w-4 h-4" />
            שמור שינויים
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}