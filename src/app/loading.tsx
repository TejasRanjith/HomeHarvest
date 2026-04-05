import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      {/* Hero Skeleton (Main + 2 Side banners) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton variant="card" className="col-span-2 h-[400px] w-full" />
        <div className="flex flex-col gap-6">
          <Skeleton variant="card" className="h-[188px] w-full" />
          <Skeleton variant="card" className="h-[188px] w-full" />
        </div>
      </div>

      {/* Featured Products Skeleton Horizontal */}
      <div>
        <Skeleton variant="text" className="w-[200px] mb-6 h-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="card" className="h-[280px]" />
          ))}
        </div>
      </div>

      {/* Promo Banner Skeleton */}
      <Skeleton variant="card" className="h-[140px] w-full" />

      {/* Best Sellers Skeleton */}
      <div>
        <Skeleton variant="text" className="w-[180px] mb-6 h-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} variant="text" className="h-20 w-full" />)}
          </div>
          <Skeleton variant="card" className="h-full min-h-[300px] shadow-primary/20" />
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} variant="text" className="h-20 w-full" />)}
          </div>
        </div>
      </div>
    </div>
  );
}
