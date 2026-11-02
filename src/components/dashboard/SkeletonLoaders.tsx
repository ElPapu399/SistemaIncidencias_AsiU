interface TableSkeletonProps {
  rows?: number;
  showFilters?: boolean;
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-slate-200 rounded" />
          <div className="h-8 w-14 bg-slate-300 rounded-lg mt-2" />
        </div>
        <div className="w-11 h-11 rounded-xl bg-slate-200" />
      </div>
      <div className="h-3.5 w-28 bg-slate-100 rounded" />
    </div>
  );
}

export function StatCardsGridSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 ${count === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-5'} gap-3 sm:gap-4`}>
      {Array.from({ length: count }).map((_, idx) => (
        <StatCardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, showFilters = true }: TableSkeletonProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-pulse">
      {/* Top Filter Bar Skeleton */}
      {showFilters && (
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center gap-3">
          <div className="w-full lg:flex-1 h-9 bg-slate-200 rounded-xl" />
          <div className="flex items-center gap-2">
            <div className="w-32 h-9 bg-slate-200 rounded-xl" />
            <div className="w-32 h-9 bg-slate-200 rounded-xl" />
            <div className="w-36 h-9 bg-slate-200 rounded-xl" />
          </div>
        </div>
      )}

      {/* Table Header Skeleton */}
      <div className="border-b border-slate-200 bg-slate-100/90 px-6 py-3.5 flex items-center justify-between">
        <div className="h-3.5 w-16 bg-slate-300 rounded" />
        <div className="h-3.5 w-32 bg-slate-300 rounded" />
        <div className="h-3.5 w-20 bg-slate-300 rounded" />
        <div className="h-3.5 w-20 bg-slate-300 rounded" />
        <div className="h-3.5 w-20 bg-slate-300 rounded" />
        <div className="h-3.5 w-24 bg-slate-300 rounded" />
        <div className="h-3.5 w-16 bg-slate-300 rounded" />
      </div>

      {/* Table Rows Skeleton */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="w-20 h-4 bg-slate-200 rounded" />
            <div className="flex-1 max-w-xs space-y-1.5">
              <div className="w-3/4 h-4 bg-slate-200 rounded" />
              <div className="w-1/2 h-3 bg-slate-100 rounded" />
            </div>
            <div className="w-24 h-4 bg-slate-200 rounded" />
            <div className="w-16 h-6 bg-slate-200 rounded-lg" />
            <div className="w-20 h-6 bg-slate-200 rounded-lg" />
            <div className="w-24 h-4 bg-slate-200 rounded" />
            <div className="w-20 h-4 bg-slate-200 rounded" />
          </div>
        ))}
      </div>

      {/* Footer Counter Skeleton */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <div className="w-36 h-3 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

export function CategoryBreakdownSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-6 animate-pulse space-y-5">
      <div className="space-y-1.5">
        <div className="h-4 w-28 bg-slate-300 rounded" />
        <div className="h-3 w-44 bg-slate-200 rounded" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="h-3.5 w-24 bg-slate-200 rounded" />
              <div className="h-3 w-12 bg-slate-200 rounded" />
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-200" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-3 w-24 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="w-12 h-6 bg-slate-200 rounded-xl" />
          </div>
          <div className="h-3 w-full bg-slate-100 rounded" />
          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <div className="h-3 w-20 bg-slate-200 rounded" />
            <div className="h-3 w-16 bg-slate-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
