import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ScheduleGridSkeleton() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b bg-white/50">
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Table Header */}
          <div className="grid grid-cols-8 gap-2 pb-3 border-b">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-8" />
            ))}
          </div>

          {/* Table Rows */}
          {[...Array(7)].map((_, row) => (
            <div key={row} className="grid grid-cols-8 gap-2">
              {[...Array(8)].map((_, col) => (
                <Skeleton key={`${row}-${col}`} className="h-12" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ScheduleGridSkeleton;
