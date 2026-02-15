'use client';

import { useVehicles } from '@/hooks/queries/use-vehicles';
import VehicleCard from '@/components/cards/vehicle';
import ListPagination from '@/components/ListPagination';
import { Skeleton } from '@/components/ui/skeleton';
import { generatePageNumbers, parseOffsetFromUrl } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

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

      <ListPagination
        isLoading={isLoading}
        totalItems={totalItems}
        startItem={startItem}
        endItem={endItem}
        limitPerPage={limitPerPage}
        onLimitChange={handleLimitChange}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        hasPrevPage={hasPrevPage}
        hasNextPage={hasNextPage}
        pageNumbers={pageNumbers}
      />
    </div>
  );
};

export default ContainerVehicleList;
