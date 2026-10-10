export function TreeLoadingSkeleton() {
  return (
    <div className="space-y-3 px-2 py-2" aria-label="Loading workspace tree">
      <div className="skeleton-shimmer h-4 w-36 rounded" />
      <div className="skeleton-shimmer ml-4 h-4 w-28 rounded" />
      <div className="skeleton-shimmer h-4 w-40 rounded" />
    </div>
  );
}

export function BoardLoadingSkeleton() {
  return (
    <div
      className="grid min-h-[540px] gap-4 overflow-hidden md:grid-cols-3"
      aria-label="Loading tasks"
    >
      {[1, 2, 3].map((column) => (
        <div
          key={column}
          className="rounded-panel border border-border bg-[#f1f3f8] p-3"
        >
          <div className="skeleton-shimmer mb-5 h-5 w-28 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((card) => (
              <div
                key={card}
                className="skeleton-shimmer h-32 rounded-control border border-[#e5e8f0]"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
