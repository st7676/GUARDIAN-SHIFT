import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-[1600px] mx-auto p-4 md:p-6">
        {/* Debug Info Skeleton */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-40" />
            ))}
          </div>
        </div>

        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="grid lg:grid-cols-4 gap-4 md:gap-6">
          {/* Schedule Grid Skeleton */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-white/50">
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {[...Array(7)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-4 md:space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;
