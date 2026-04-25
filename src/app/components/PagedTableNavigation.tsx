interface PagedTableNavigationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}

function buildVisiblePages(currentPage: number, totalPages: number) {
  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return pages;
}

export function PagedTableNavigation({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  isLoading = false,
  onPageChange,
}: PagedTableNavigationProps) {
  if (totalElements === 0) {
    return null;
  }

  const safeTotalPages = Math.max(totalPages, 1);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalElements);
  const visiblePages = buildVisiblePages(currentPage, safeTotalPages);

  return (
    <div className="flex flex-col gap-4 border-t border-stone-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-stone-500">
        Showing {startItem}-{endItem} of {totalElements}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={isLoading || currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-xl border border-stone-200 px-4 py-2 text-sm text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        {visiblePages.map((page) => (
          <button
            key={page}
            type="button"
            disabled={isLoading}
            onClick={() => onPageChange(page)}
            className={`rounded-xl px-4 py-2 text-sm transition ${
              page === currentPage
                ? 'bg-stone-900 text-white'
                : 'border border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-stone-50'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          disabled={isLoading || currentPage >= safeTotalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-xl border border-stone-200 px-4 py-2 text-sm text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
