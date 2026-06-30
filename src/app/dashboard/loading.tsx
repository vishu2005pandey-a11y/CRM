export default function DashboardLoading() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="h-8 w-[200px] bg-muted animate-pulse rounded-md"></div>
        <div className="h-10 w-[150px] bg-muted animate-pulse rounded-md"></div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-soft p-6 space-y-4">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-[100px] bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-4 bg-muted animate-pulse rounded-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-[120px] bg-muted animate-pulse rounded"></div>
              <div className="h-3 w-[150px] bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-soft">
          <div className="p-6">
            <div className="h-5 w-[150px] bg-muted animate-pulse rounded mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-muted animate-pulse"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-[200px] bg-muted animate-pulse rounded"></div>
                    <div className="h-3 w-[150px] bg-muted animate-pulse rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-soft">
          <div className="p-6 space-y-4">
            <div className="h-5 w-[120px] bg-muted animate-pulse rounded mb-4"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 w-full bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
