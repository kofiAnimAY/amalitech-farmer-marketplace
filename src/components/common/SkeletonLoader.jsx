/** Generic shimmering block — compose these into any layout-specific skeleton. */
export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="h-36 w-full rounded-none sm:h-40" />
      <div className="space-y-2 p-3.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-10" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="card space-y-3 p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div className="card space-y-3 p-4">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="card flex items-center gap-3 p-3">
      <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-8 w-16 rounded-lg" />
    </div>
  );
}

export function TextLineSkeleton({ className = 'h-4 w-full' }) {
  return <Skeleton className={className} />;
}
