'use client';

export default function ReportLoading() {
  return (
    <main className="min-h-screen px-4 py-12 max-w-4xl mx-auto">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="h-8 w-64 bg-muted rounded-lg mb-2"></div>
            <div className="h-4 w-40 bg-muted rounded-lg"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-28 bg-muted rounded-lg"></div>
            <div className="h-10 w-32 bg-muted rounded-lg"></div>
          </div>
        </div>

        {/* Score cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-xl border border-border bg-card text-center">
              <div className="h-4 w-24 bg-muted rounded mx-auto mb-4"></div>
              <div className="h-12 w-20 bg-muted rounded-lg mx-auto mb-2"></div>
              <div className="h-3 w-16 bg-muted rounded mx-auto"></div>
            </div>
          ))}
        </div>

        {/* AI Summary skeleton */}
        <div className="p-5 rounded-xl border border-border bg-card mb-8">
          <div className="h-4 w-28 bg-muted rounded mb-3"></div>
          <div className="h-3 w-full bg-muted rounded mb-2"></div>
          <div className="h-3 w-3/4 bg-muted rounded"></div>
        </div>

        {/* Chart skeleton */}
        <div className="p-5 rounded-xl border border-border bg-card mb-8">
          <div className="h-5 w-52 bg-muted rounded mb-4"></div>
          <div className="h-64 w-full bg-muted/50 rounded-lg"></div>
        </div>

        {/* Recommendations skeleton */}
        <div className="mb-8">
          <div className="h-5 w-48 bg-muted rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="h-4 w-16 bg-muted rounded mb-2"></div>
                    <div className="h-4 w-72 bg-muted rounded mb-2"></div>
                    <div className="h-3 w-full bg-muted/60 rounded"></div>
                  </div>
                  <div className="h-8 w-16 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
