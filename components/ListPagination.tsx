'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldLabel } from '@/components/ui/field';
import { cn } from '@/lib/utils';

const LIMIT_OPTIONS = [12, 24, 48, 96] as const;

interface ListPaginationProps {
  isLoading: boolean;
  totalItems: number | null;
  startItem: number;
  endItem: number;
  limitPerPage: number;
  onLimitChange: (value: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  pageNumbers: (number | 'ellipsis')[] | null;
}

const ListPagination = ({
  isLoading,
  totalItems,
  startItem,
  endItem,
  limitPerPage,
  onLimitChange,
  currentPage,
  onPageChange,
  hasPrevPage,
  hasNextPage,
  pageNumbers,
}: ListPaginationProps) => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border p-4">
    {isLoading ? (
      <>
        <Skeleton className="h-9 w-64 bg-gray-200 rounded-md" />
        <Skeleton className="h-9 w-72 bg-gray-200 rounded-md" />
      </>
    ) : (
      <>
        <Field orientation="horizontal" className="w-fit text-primary">
          <FieldLabel htmlFor="select-rows-per-page">
            {totalItems !== null
              ? `Menampilkan ${startItem} - ${endItem} dari ${totalItems} data`
              : `Menampilkan ${startItem} - ${endItem} data`}
          </FieldLabel>
          <Select value={limitPerPage.toString()} onValueChange={onLimitChange}>
            <SelectTrigger className="w-20" id="select-rows-per-page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                {LIMIT_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt.toString()}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Pagination className="w-fit mx-0 flex items-center justify-center">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => hasPrevPage && onPageChange(currentPage - 1)}
                className={cn(
                  'cursor-pointer',
                  !hasPrevPage && 'pointer-events-none opacity-50',
                )}
              />
            </PaginationItem>

            {pageNumbers ? (
              pageNumbers.map((page, idx) =>
                page === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page}>
                    <PaginationLink
                      className="cursor-pointer"
                      isActive={page === currentPage}
                      onClick={() => onPageChange(page)}
                    >
                      {page + 1}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )
            ) : (
              <PaginationItem>
                <PaginationLink isActive className="cursor-pointer">
                  {currentPage + 1}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => hasNextPage && onPageChange(currentPage + 1)}
                className={cn(
                  'cursor-pointer',
                  !hasNextPage && 'pointer-events-none opacity-50',
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </>
    )}
  </div>
);

export default ListPagination;
