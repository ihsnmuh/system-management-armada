'use client';

import { useVehicles } from '@/hooks/queries/use-vehicles';
import VehicleCard from '@/components/cards/vehicle';
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
import { cn, generatePageNumbers, parseOffsetFromUrl } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const LIMIT_OPTIONS = [10, 30, 50, 100] as const;

const ContainerVehicleList = () => {
  const [limitPerPage, setLimitPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [includeVehicles] = useState<string[]>(['route']);

  const { data, isLoading, isFetching } = useVehicles({
    limit: limitPerPage,
    offset: currentPage * limitPerPage,
    include: includeVehicles.join(','),
  });

  const isRefetching = isFetching && !isLoading;

  const hasPrevPage = currentPage > 0;
  const hasNextPage = !!data?.links?.next;

  const lastOffset = data?.links?.last
    ? parseOffsetFromUrl(data.links.last)
    : null;

  const totalItems = lastOffset !== null ? lastOffset + limitPerPage : null;
  const totalPages =
    lastOffset !== null ? Math.floor(lastOffset / limitPerPage) + 1 : null;

  const startItem = currentPage * limitPerPage + 1;
  const endItem = currentPage * limitPerPage + (data?.data?.length ?? 0);

  const pageNumbers =
    totalPages !== null ? generatePageNumbers(currentPage, totalPages) : null;

  const handleLimitChange = (value: string) => {
    setLimitPerPage(Number(value));
    setCurrentPage(0);
  };

  const vehicles = data?.data.map((vehicle) => {
    const routeId = vehicle.relationships.route.data?.id;
    const routeDetail = data?.included?.find(
      (item) => item.type === 'route' && item.id === routeId,
    );

    return {
      ...vehicle,
      routeDetail: routeDetail ?? null,
    };
  });

  return (
    <div className="layout relative flex flex-col gap-4">
      {isRefetching && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {'Memperbarui data...'}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {!isLoading &&
          vehicles?.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}

        {isLoading &&
          Array.from({ length: limitPerPage }).map((_, index) => (
            <div key={index}>
              <Skeleton className="w-full h-[300px] rounded-lg bg-gray-200" />
            </div>
          ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border p-4">
        {isLoading ? (
          <>
            <Skeleton className="h-9 w-64 bg-gray-200 rounded-md" />
            <Skeleton className="h-9 w-72 bg-gray-200 rounded-md" />
          </>
        ) : (
          <>
            <Field orientation="horizontal" className="w-fit">
              <FieldLabel htmlFor="select-rows-per-page">
                {totalItems !== null
                  ? `Menampilkan ${startItem} - ${endItem} dari ${totalItems} data`
                  : `Menampilkan ${startItem} - ${endItem} data`}
              </FieldLabel>
              <Select
                value={limitPerPage.toString()}
                onValueChange={handleLimitChange}
              >
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
                    onClick={() => hasPrevPage && setCurrentPage((p) => p - 1)}
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
                          onClick={() => setCurrentPage(page)}
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
                    onClick={() => hasNextPage && setCurrentPage((p) => p + 1)}
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
    </div>
  );
};

export default ContainerVehicleList;
