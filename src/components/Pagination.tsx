import { ChevronLeft, ChevronRight } from "lucide-react";

// Provides compact previous/next navigation for paged task results.
export function Pagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  return (
    <nav
      aria-label="Task pages"
      className="flex items-center justify-between border-t border-[#eef0f5] px-5 py-3"
    >
      <span className="text-xs text-[#98a0b1]">
        Page {page + 1} of {pageCount}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#7c8498] transition hover:bg-[#f5f6fa] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          aria-label="Next page"
          disabled={page === pageCount - 1}
          onClick={() => onPageChange(page + 1)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#7c8498] transition hover:bg-[#f5f6fa] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
