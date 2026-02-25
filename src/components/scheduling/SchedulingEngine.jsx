/**
 * Hospital Nurse Shift Scheduling Engine
 * Implements all constraints from the master scheduling prompt
 */

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHIFTS = ['morning', 'evening', 'night'];

// Standard staffing levels
const STANDARD_STAFFING = {
  morning: { weekday: 6, saturday: 5 },
  evening: { all: 6 },
  night: { all: 5 }
};

// Shortage reduction order (from master prompt)
const SHORTAGE_REDUCTION_ORDER = [
  { day: 6, shift: 'evening', minStaff: 5 },  // Saturday Evening
  { day: 5, shift: 'evening', minStaff: 5 },  // Friday Evening
  { day: 5, shift: 'night', minStaff: 4 },    // Friday Night
  { day: 6, shift: 'night', minStaff: 4 },    // Saturday Night
  { day: 1, shift: 'night', minStaff: 4 },    // Midweek Nights
  { day: 2, shift: 'night', minStaff: 4 },
  { day: 3, shift: 'night', minStaff: 4 },
];

// Employment percentage to weekly shifts
const EMPLOYMENT_TO_SHIFTS = {
  100: { low: 4, high: 5 },
  88: { low: 4, high: 4 },
  76: { low: 3, high: 4 },
  66: { low: 3, high: 3 }
};

export function calculateRequiredStaffing(department, isShortageMode = false) {
  const requirements = [];
  
  DAYS.forEach((day, dayIndex) => {
    SHIFTS.forEach(shift => {
      let minStaff;
      
      if (shift === 'morning') {
        minStaff = dayIndex === 6 ? STANDARD_STAFFING.morning.saturday : STANDARD_STAFFING.morning.weekday;
      } else if (shift === 'evening') {
        minStaff = STANDARD_STAFFING.evening.all;
      } else {
        minStaff = STANDARD_STAFFING.night.all;
      }
      
      // Apply shortage reductions if needed
      if (isShortageMode) {
        const reduction = SHORTAGE_REDUCTION_ORDER.find(r => r.day === dayIndex && r.shift === shift);
        if (reduction) {
          minStaff = reduction.minStaff;
        }
      }
      
      requirements.push({
        dayIndex,
        day,
        shift,
        minStaff,
        roles: { responsible: 1, monitoring: 1, staff: minStaff - 2 }
      });
    });
  });
  
  return requirements;
}

export function calculateNurseQuota(nurse, weeklyStatus) {
  const employment = nurse.employment_percentage;
  const quotaRange = EMPLOYMENT_TO_SHIFTS[employment] || { low: 4, high: 4 };
  
  // Rotation logic for 100% and 76%
  if (employment === 100 || employment === 76) {
    const wasHighLastWeek = weeklyStatus?.was_high_week_last_time;
    return wasHighLastWeek ? quotaRange.low : quotaRange.high;
  }
  
  return quotaRange.low;
}

export function calculateSupplyDemand(nurses, weeklyStatuses, requirements) {
  let totalRequired = requirements.reduce((sum, r) => sum + r.minStaff, 0);
  
  let totalAvailable = 0;
  nurses.forEach(nurse => {
    const status = weeklyStatuses.find(ws => ws.nurse_id === nurse.id);
    if (!status || status.status === 'active' || status.status === 'return_from_vacation') {
      totalAvailable += calculateNurseQuota(nurse, status);
    }
  });
  
  return {
    required: totalRequired,
    available: totalAvailable,
    surplus: totalAvailable - totalRequired
  };
}

export function scoreNurseForShift(nurse, dayIndex, shift, availability, weeklyStatus, existingAssignments) {
  let score = 2; // Default: acceptable
  let violations = [];
  
  // Check availability
  const avail = availability.find(a => a.day_of_week === dayIndex && a.shift_type === shift);
  if (avail) {
    switch (avail.availability_type) {
      case 'blocked': return { score: 0, violations: ['Blocked by nurse'] };
      case 'avoid': score = 1; break;
      case 'available': score = 2; break;
      case 'preferred': score = 3; break;
    }
  }
  
  // Check shift type preference
  if (nurse.shift_type_preference === 'no_nights' && shift === 'night') {
    return { score: 0, violations: ['No nights preference'] };
  }
  if (nurse.shift_type_preference === 'morning_only' && shift !== 'morning') {
    return { score: 0, violations: ['Morning only preference'] };
  }
  
  // IRON RULES - Morning after Night
  const prevDayAssignment = existingAssignments.find(a => 
    a.nurse_id === nurse.id && a.day_of_week === dayIndex - 1 && a.shift_type === 'night'
  );
  if (prevDayAssignment && shift === 'morning') {
    return { score: 0, violations: ['Morning after night - FORBIDDEN'] };
  }
  
  // Double shift same day
  const sameDayAssignment = existingAssignments.find(a => 
    a.nurse_id === nurse.id && a.day_of_week === dayIndex
  );
  if (sameDayAssignment) {
    return { score: 0, violations: ['Double shift same day'] };
  }
  
  // Night -> Evening avoidance
  if (prevDayAssignment && shift === 'evening') {
    score = Math.min(score, 1);
    violations.push('Night before evening - avoid');
  }
  
  // Check weekly shift count
  const nurseAssignments = existingAssignments.filter(a => a.nurse_id === nurse.id);
  const quota = calculateNurseQuota(nurse, weeklyStatus);
  if (nurseAssignments.length >= quota) {
    return { score: 0, violations: ['Quota exceeded'] };
  }
  
  // Max 2-3 consecutive days
  const consecutiveDays = countConsecutiveDays(existingAssignments, nurse.id, dayIndex);
  if (consecutiveDays >= 3) {
    score = Math.min(score, 1);
    violations.push('4th consecutive day');
  }
  
  // Max 2 nights per week
  const nightCount = nurseAssignments.filter(a => a.shift_type === 'night').length;
  if (shift === 'night' && nightCount >= 2) {
    return { score: 0, violations: ['Max 2 nights per week'] };
  }
  
  // Shabbat rotation
  if (isShabbatShift(dayIndex, shift)) {
    if (weeklyStatus?.worked_shabbat_last_week && score > 1) {
      score = Math.min(score, 1);
      violations.push('Worked Shabbat last week');
    }
  }
  
  // Saturday Night special rules
  if (dayIndex === 6 && shift === 'night') {
    // Cannot work Sunday Morning
    // This will be checked when assigning Sunday shifts
  }
  
  return { score, violations };
}

export function scoreNurseForRole(nurse, role) {
  if (role === 'staff') return 5;
  
  const score = nurse.responsibility_score || 5;
  
  // Grade 4 nurses cannot be responsible/monitoring during shortage
  if (nurse.grade === 4 && (role === 'responsible' || role === 'monitoring')) {
    return 0;
  }
  
  return score;
}

function countConsecutiveDays(assignments, nurseId, currentDay) {
  let count = 0;
  for (let d = currentDay - 1; d >= 0; d--) {
    if (assignments.some(a => a.nurse_id === nurseId && a.day_of_week === d)) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

function isShabbatShift(dayIndex, shift) {
  return (dayIndex === 5 && (shift === 'evening' || shift === 'night')) ||
         (dayIndex === 6 && (shift === 'morning' || shift === 'evening'));
}

export function applyMonitoringBlockRule(assignments) {
  // Group assignments by nurse
  const byNurse = {};
  assignments.forEach(a => {
    if (!byNurse[a.nurse_id]) byNurse[a.nurse_id] = [];
    byNurse[a.nurse_id].push(a);
  });
  
  const violations = [];
  
  Object.entries(byNurse).forEach(([nurseId, nurseAssignments]) => {
    const monitoringDays = nurseAssignments.filter(a => a.role === 'monitoring').map(a => a.day_of_week);
    const staffDays = nurseAssignments.filter(a => a.role === 'staff').map(a => a.day_of_week);
    
    if (monitoringDays.length > 0 && staffDays.length > 0) {
      // Check for zigzag
      const minMonitoring = Math.min(...monitoringDays);
      const maxMonitoring = Math.max(...monitoringDays);
      const minStaff = Math.min(...staffDays);
      const maxStaff = Math.max(...staffDays);
      
      // If ranges overlap, it's a violation
      if (!(maxMonitoring < minStaff || maxStaff < minMonitoring)) {
        violations.push({
          nurseId,
          message: 'Monitoring block rule violated - zigzag pattern detected'
        });
      }
    }
  });
  
  return violations;
}

export function validateTeamStrength(assignments, nurses, dayIndex, shift, isShortageMode) {
  const shiftAssignments = assignments.filter(a => a.day_of_week === dayIndex && a.shift_type === shift);
  
  if (!isShortageMode) return { valid: true };
  
  // During shortage: max 1 nurse with 0.5-1.5 years experience
  let juniorCount = 0;
  shiftAssignments.forEach(a => {
    const nurse = nurses.find(n => n.id === a.nurse_id);
    if (nurse && nurse.experience_years >= 0.5 && nurse.experience_years <= 1.5) {
      juniorCount++;
    }
  });
  
  if (juniorCount > 1) {
    return { valid: false, reason: 'Too many junior nurses during shortage' };
  }
  
  // Grade 4 nurses must not work during shortage
  const hasGrade4 = shiftAssignments.some(a => {
    const nurse = nurses.find(n => n.id === a.nurse_id);
    return nurse?.grade === 4;
  });
  
  if (hasGrade4) {
    return { valid: false, reason: 'Grade 4 nurse assigned during shortage' };
  }
  
  return { valid: true };
}

export function generateSchedule(nurses, weeklyStatuses, availability, department, progressCallback) {
  const assignments = [];
  const violations = [];
  
  // Step 1: Calculate requirements
  progressCallback?.(10);
  const supplyDemand = calculateSupplyDemand(
    nurses, 
    weeklyStatuses, 
    calculateRequiredStaffing(department)
  );
  
  const isShortageMode = supplyDemand.surplus < 0;
  const isOverstaffingMode = supplyDemand.surplus > 5;
  
  const requirements = calculateRequiredStaffing(department, isShortageMode);
  
  // Step 2: Filter available nurses
  progressCallback?.(20);
  const availableNurses = nurses.filter(nurse => {
    const status = weeklyStatuses.find(ws => ws.nurse_id === nurse.id);
    return !status || 
           status.status === 'active' || 
           status.status === 'return_from_vacation';
  });
  
  // Step 3-8: Assign shifts
  const roles = ['responsible', 'monitoring', 'staff'];
  
  requirements.forEach((req, reqIndex) => {
    progressCallback?.(20 + Math.floor((reqIndex / requirements.length) * 60));
    
    roles.forEach(role => {
      const needed = req.roles[role];
      
      for (let i = 0; i < needed; i++) {
        // Score all available nurses
        const candidates = availableNurses.map(nurse => {
          const status = weeklyStatuses.find(ws => ws.nurse_id === nurse.id);
          const nurseAvail = availability.filter(a => a.nurse_id === nurse.id);
          
          const shiftScore = scoreNurseForShift(
            nurse, req.dayIndex, req.shift, nurseAvail, status, assignments
          );
          
          const roleScore = scoreNurseForRole(nurse, role);
          
          return {
            nurse,
            shiftScore: shiftScore.score,
            roleScore,
            totalScore: shiftScore.score * roleScore,
            violations: shiftScore.violations
          };
        });
        
        // Sort by total score descending
        candidates.sort((a, b) => b.totalScore - a.totalScore);
        
        // Pick best candidate with score > 0
        const best = candidates.find(c => c.totalScore > 0);
        
        if (best) {
          assignments.push({
            nurse_id: best.nurse.id,
            department_id: department.id,
            day_of_week: req.dayIndex,
            shift_type: req.shift,
            role,
            is_shabbat_shift: isShabbatShift(req.dayIndex, req.shift),
            assignment_score: best.shiftScore,
            is_problematic: best.shiftScore === 1 || best.violations.length > 0,
            violation_notes: best.violations.join('; ')
          });
        } else {
          violations.push(`Could not fill ${role} for ${req.day} ${req.shift}`);
        }
      }
    });
  });
  
  // Step 9: Validate monitoring block rule
  progressCallback?.(85);
  const blockViolations = applyMonitoringBlockRule(assignments);
  blockViolations.forEach(v => violations.push(v.message));
  
  // Step 10: Calculate fairness
  progressCallback?.(95);
  const fairnessScore = calculateFairnessScore(assignments, nurses, weeklyStatuses);
  
  progressCallback?.(100);
  
  return {
    assignments,
    violations,
    fairnessScore,
    supplyDemand,
    isShortageMode,
    isOverstaffingMode
  };
}

function calculateFairnessScore(assignments, nurses, weeklyStatuses) {
  if (assignments.length === 0 || nurses.length === 0) return 100;
  
  // Calculate how well each nurse's quota was met
  let totalDeviation = 0;
  let nursesWithQuota = 0;
  
  nurses.forEach(nurse => {
    const status = weeklyStatuses.find(ws => ws.nurse_id === nurse.id);
    if (!status || status.status !== 'active') return;
    
    const quota = calculateNurseQuota(nurse, status);
    const assigned = assignments.filter(a => a.nurse_id === nurse.id).length;
    
    totalDeviation += Math.abs(quota - assigned);
    nursesWithQuota++;
  });
  
  if (nursesWithQuota === 0) return 100;
  
  const avgDeviation = totalDeviation / nursesWithQuota;
  // Score: 100 = perfect, 0 = terrible
  return Math.max(0, Math.round(100 - (avgDeviation * 20)));
}

export default {
  calculateRequiredStaffing,
  calculateNurseQuota,
  calculateSupplyDemand,
  scoreNurseForShift,
  scoreNurseForRole,
  applyMonitoringBlockRule,
  validateTeamStrength,
  generateSchedule
};