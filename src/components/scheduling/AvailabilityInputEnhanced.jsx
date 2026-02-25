import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, Check, AlertTriangle, X, Globe, EyeOff } from 'lucide-react';
import { cn } from "@/lib/utils";

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const SHIFTS = ['בוקר', 'ערב', 'לילה'];
const SHIFT_TYPES = ['morning', 'evening', 'night'];

const AVAILABILITY_TYPES = [
  { value: 'none', label: 'רגיל', icon: null, color: 'bg-white border-slate-200' },
  { value: 'blocked', label: 'חסום', icon: X, color: 'bg-red-50 border-red-300' },
  { value: 'avoid', label: 'להימנע', icon: AlertTriangle, color: 'bg-orange-50 border-orange-300' },
  { value: 'preferred', label: 'מועדף', icon: Star, color: 'bg-amber-50 border-amber-300' },
];

export default function AvailabilityInputEnhanced({
  existingAvailability = [],
  nurseShiftPreference = 'any',
  onAvailabilityChange,
  isReadOnly = false,
  isHeadNurse = false,
  showHiddenBlocks = false
}) {
  const [matrix, setMatrix] = useState({});
  const [specialRequest, setSpecialRequest] = useState('');
  const [blockCounts, setBlockCounts] = useState({ regular: 0, persistent: 0, hidden: 0 });

  useEffect(() => {
    const newMatrix = {};
    let regularBlocks = 0, persistentBlocks = 0, hiddenBlocks = 0;

    DAYS.forEach((_, dayIndex) => {
      SHIFT_TYPES.forEach(shiftType => {
        const key = `${dayIndex}-${shiftType}`;
        const existing = existingAvailability.find(
          a => a.day_of_week === dayIndex && a.shift_type === shiftType
        );

        if (existing) {
          newMatrix[key] = {
            type: existing.availability_type,
            isPersistent: existing.is_persistent || false,
            isHiddenAdminBlock: existing.is_hidden_admin_block || false
          };

          if (existing.availability_type === 'blocked') {
            if (existing.is_hidden_admin_block) hiddenBlocks++;
            else if (existing.is_persistent) persistentBlocks++;
            else regularBlocks++;
          }

          if (existing.free_text_request) {
            setSpecialRequest(existing.free_text_request);
          }
        } else {
          newMatrix[key] = { type: 'none', isPersistent: false, isHiddenAdminBlock: false };
        }
      });
    });

    setMatrix(newMatrix);
    setBlockCounts({ regular: regularBlocks, persistent: persistentBlocks, hidden: hiddenBlocks });
  }, [existingAvailability]);

  const handleCellClick = (dayIndex, shiftType) => {
    if (isReadOnly) return;
    if (isShiftBlocked(shiftType, nurseShiftPreference) && !isHeadNurse) return;

    const key = `${dayIndex}-${shiftType}`;
    const current = matrix[key] || { type: 'none', isPersistent: false, isHiddenAdminBlock: false };
    
    // Count current blocks
    const currentBlocks = Object.values(matrix).filter(
      cell => cell.type === 'blocked' && !cell.isPersistent && !cell.isHiddenAdminBlock
    ).length;
    
    // Determine available type order based on block count
    let typeOrder;
    if (!isHeadNurse && currentBlocks >= 6 && current.type !== 'blocked') {
      // At limit, can't add more blocks
      typeOrder = ['none', 'avoid', 'preferred'];
      if (current.type === 'none') {
        alert('הגעת למספר המקסימלי של משמרות חסומות');
        return;
      }
    } else {
      // Normal flow or head nurse
      typeOrder = isHeadNurse 
        ? ['none', 'blocked', 'avoid', 'preferred']
        : ['none', 'blocked', 'avoid', 'preferred'];
    }
    
    const currentIndex = typeOrder.indexOf(current.type);
    const nextType = typeOrder[(currentIndex + 1) % typeOrder.length];

    const newMatrix = {
      ...matrix,
      [key]: { ...current, type: nextType }
    };

    setMatrix(newMatrix);
    emitChanges(newMatrix, specialRequest);
  };

  const togglePersistent = (dayIndex, shiftType) => {
    if (!isHeadNurse) return;
    
    const key = `${dayIndex}-${shiftType}`;
    const current = matrix[key] || { type: 'none', isPersistent: false, isHiddenAdminBlock: false };
    
    const newMatrix = {
      ...matrix,
      [key]: { ...current, isPersistent: !current.isPersistent }
    };

    setMatrix(newMatrix);
    emitChanges(newMatrix, specialRequest);
  };

  const toggleHiddenBlock = (dayIndex, shiftType) => {
    if (!isHeadNurse) return;
    
    const key = `${dayIndex}-${shiftType}`;
    const current = matrix[key] || { type: 'none', isPersistent: false, isHiddenAdminBlock: false };
    
    const newMatrix = {
      ...matrix,
      [key]: { 
        ...current, 
        isHiddenAdminBlock: !current.isHiddenAdminBlock,
        type: !current.isHiddenAdminBlock ? 'blocked' : current.type
      }
    };

    setMatrix(newMatrix);
    emitChanges(newMatrix, specialRequest);
  };

  const emitChanges = (newMatrix, request) => {
    const availability = [];
    Object.entries(newMatrix).forEach(([key, value]) => {
      if (value.type !== 'none') {
        const [dayIndex, shiftType] = key.split('-');
        availability.push({
          day_of_week: parseInt(dayIndex),
          shift_type: shiftType,
          availability_type: value.type,
          is_persistent: value.isPersistent,
          is_hidden_admin_block: value.isHiddenAdminBlock,
          free_text_request: request || undefined
        });
      }
    });
    onAvailabilityChange(availability, request);
  };

  const isShiftBlocked = (shiftType, preference) => {
    const blockMap = {
      'morning_only': ['evening', 'night'],
      'evening_only': ['morning', 'night'],
      'night_only': ['morning', 'evening'],
      'no_nights': ['night']
    };
    return blockMap[preference]?.includes(shiftType) || false;
  };

  const getCellConfig = (dayIndex, shiftType) => {
    const key = `${dayIndex}-${shiftType}`;
    const cell = matrix[key] || { type: 'none', isPersistent: false, isHiddenAdminBlock: false };
    const config = AVAILABILITY_TYPES.find(t => t.value === cell.type);
    return { ...cell, ...config };
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Legend */}
      <div className="flex flex-wrap gap-2 items-center justify-center">
        {AVAILABILITY_TYPES.map(type => {
          const Icon = type.icon;
          return (
            <Badge key={type.value} variant="outline" className={cn("gap-1", type.color)}>
              {Icon && <Icon className="w-3 h-3" />}
              {type.label}
            </Badge>
          );
        })}
        {isHeadNurse && (
          <>
            <Badge variant="outline" className="gap-1 bg-purple-50 border-purple-300">
              <Globe className="w-3 h-3" />
              קבוע
            </Badge>
            <Badge variant="outline" className="gap-1 bg-slate-800 text-white">
              <EyeOff className="w-3 h-3" />
              מוסתר
            </Badge>
          </>
        )}
      </div>

      {/* Block Counter */}
      <div className="text-center text-sm text-slate-600">
        חסימות: {blockCounts.regular} רגילות
        {blockCounts.persistent > 0 && ` | ${blockCounts.persistent} קבועות`}
        {isHeadNurse && blockCounts.hidden > 0 && ` | ${blockCounts.hidden} מוסתרות`}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-slate-100 text-sm font-semibold">יום</th>
              {SHIFTS.map(shift => (
                <th key={shift} className="border p-2 bg-slate-100 text-sm font-semibold">{shift}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, dayIndex) => (
              <tr key={dayIndex}>
                <td className="border p-2 text-sm font-medium bg-slate-50">{day}</td>
                {SHIFT_TYPES.map((shiftType, shiftIndex) => {
                  const config = getCellConfig(dayIndex, shiftType);
                  const Icon = config.icon;
                  const isBlocked = isShiftBlocked(shiftType, nurseShiftPreference);
                  const shouldHideHiddenBlock = config.isHiddenAdminBlock && !showHiddenBlocks;

                  return (
                    <td key={shiftType} className="border p-0">
                      <div className="relative group">
                        <button
                          onClick={() => handleCellClick(dayIndex, shiftType)}
                          disabled={isReadOnly || (isBlocked && !isHeadNurse)}
                          className={cn(
                            "w-full h-16 transition-all border-2",
                            shouldHideHiddenBlock ? "bg-white border-slate-200" : config.color,
                            isReadOnly || (isBlocked && !isHeadNurse) 
                              ? "cursor-not-allowed opacity-50" 
                              : "cursor-pointer hover:opacity-80",
                            "flex items-center justify-center relative"
                          )}
                        >
                          {!shouldHideHiddenBlock && Icon && <Icon className="w-5 h-5" />}
                          
                          {config.isPersistent && (
                            <Globe className="w-3 h-3 absolute top-1 right-1 text-purple-600" />
                          )}
                          
                          {config.isHiddenAdminBlock && showHiddenBlocks && (
                            <EyeOff className="w-3 h-3 absolute top-1 left-1 text-slate-700" />
                          )}
                        </button>

                        {/* Admin Controls */}
                        {isHeadNurse && !isReadOnly && (
                          <div className="absolute top-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 bg-opacity-90 flex gap-1 p-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs text-white hover:bg-slate-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePersistent(dayIndex, shiftType);
                              }}
                            >
                              <Globe className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs text-white hover:bg-slate-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleHiddenBlock(dayIndex, shiftType);
                              }}
                            >
                              <EyeOff className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          בקשות מיוחדות / הערות
        </label>
        <Textarea
          value={specialRequest}
          onChange={(e) => {
            setSpecialRequest(e.target.value);
            emitChanges(matrix, e.target.value);
          }}
          placeholder="הוסיפי כאן בקשות מיוחדות או הערות..."
          className="h-20"
          disabled={isReadOnly}
        />
      </div>
    </div>
  );
}