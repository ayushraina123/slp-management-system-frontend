import { useEffect, useState } from 'react';
import { toErrorMessage } from '../lib/errors';
import type { PagedResponse } from '../types';

interface UsePagedResourceOptions<T> {
  pageSize: number;
  errorMessage: string;
  loader: (pageNumber: number, pageSize: number) => Promise<PagedResponse<T>>;
}

export function usePagedResource<T>({
  pageSize,
  errorMessage,
  loader,
}: UsePagedResourceOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  async function loadPage(page = currentPage) {
    setIsLoading(true);
    setError('');

    try {
      const response = await loader(page, pageSize);

      if (response.totalPages > 0 && page > response.totalPages) {
        setCurrentPage(response.totalPages);
        return;
      }

      if (response.totalPages === 0 && page !== 1) {
        setCurrentPage(1);
        return;
      }

      setItems(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      setError(toErrorMessage(err, errorMessage));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPage(currentPage);
  }, [currentPage]);

  return {
    items,
    currentPage,
    totalPages,
    totalElements,
    error,
    isLoading,
    setCurrentPage,
    setError,
    loadPage,
  };
}
