import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Sparkles, AlertTriangle, CheckCircle, Loader2, Settings } from 'lucide-react';
import { cn } from "@/lib/utils";

const GENERATION_STEPS = [
  'Validating nurse availability',
  'Calculating shift quotas',
  'Balancing supply and demand',
  'Assigning responsible roles',
  'Assigning monitoring roles',
  'Filling staff positions',
  'Applying block rules',
  'Checking safety constraints',
  'Optimizing fairness',
  'Finalizing schedule'
];

export default function ScheduleGenerator({ 
  onGenerate, 
  isGenerating, 
  generationProgress,
  supplyDemandBalance,
  validationWarnings 
}) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-500" />
            Schedule Generator
          </CardTitle>
          <CardDescription className="mt-1">
            Auto-generate an optimal schedule based on all constraints
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Supply/Demand Balance */}
        {supplyDemandBalance && (
          <div className="p-4 rounded-lg bg-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Supply vs Demand</span>
              <span className={cn(
                "text-sm font-semibold",
                supplyDemandBalance.surplus > 0 ? "text-amber-600" : 
                supplyDemandBalance.surplus < 0 ? "text-red-600" : "text-emerald-600"
              )}>
                {supplyDemandBalance.surplus > 0 ? `+${supplyDemandBalance.surplus} surplus` :
                 supplyDemandBalance.surplus < 0 ? `${supplyDemandBalance.surplus} shortage` :
                 'Balanced'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Required shifts:</span>
                <span className="ml-2 font-medium">{supplyDemandBalance.required}</span>
              </div>
              <div>
                <span className="text-slate-500">Available shifts:</span>
                <span className="ml-2 font-medium">{supplyDemandBalance.available}</span>
              </div>
            </div>
          </div>
        )}

        {/* Validation Warnings */}
        {validationWarnings?.length > 0 && (
          <div className="space-y-2">
            {validationWarnings.map((warning, idx) => (
              <Alert key={idx} variant="warning" className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">{warning}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Generation Progress */}
        {isGenerating && (
          <div className="space-y-3">
            <Progress value={generationProgress} className="h-2" />
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              {GENERATION_STEPS[Math.floor((generationProgress / 100) * GENERATION_STEPS.length)] || 'Processing...'}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button 
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white shadow-lg"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Schedule...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Optimal Schedule
            </>
          )}
        </Button>

        <p className="text-xs text-center text-slate-400">
          The algorithm respects all safety rules, preferences, and fairness constraints
        </p>
      </CardContent>
    </Card>
  );
}