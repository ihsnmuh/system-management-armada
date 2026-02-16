'use client';

import { useVehicleById, useVehicles } from '@/hooks/queries/use-vehicles';
import VehicleCard from '@/components/cards/vehicle';
import ListPagination from '@/components/ListPagination';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { generatePageNumbers, parseOffsetFromUrl } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import VehicleFilter from '@/components/VehicleFilter';
import { DialogDetail } from '@/components/DialogDetail';
import type { Route } from '@/types/api';

const ContainerVehicleList = () => {  
  const [limitPerPage, setLimitPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [includeVehicles] = useState<string[]>(['route', 'trip']);
  const [appliedRouteIds, setAppliedRouteIds] = useState<string[]>([]);
  const [appliedTripIds, setAppliedTripIds] = useState<string[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState({
    id: '',
    isOpen: false,
  });

  const { data, isLoading, isFetching } = useVehicles({
    limit: limitPerPage,
    offset: currentPage * limitPerPage,
    include: includeVehicles.join(','),
    ...(appliedRouteIds.length > 0 && {
      filterRoute: appliedRouteIds.join(','),
    }),
    ...(appliedTripIds.length > 0 && {
      filterTrip: appliedTripIds.join(','),
    }),
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

  const {
    data: vehicleDetail,
    isLoading: isVehicleDetailLoading,
    isFetching: isVehicleDetailFetching,
    isRefetching: isVehicleDetailRefetching,
    refetch: refetchVehicleDetail,
  } = useVehicleById(selectedVehicle.id);

  const handleLimitChange = (value: string) => {
    setLimitPerPage(Number(value));
    setCurrentPage(0);
  };

  const handleApplyFilter = (payload: {
    routeIds: string[];
    tripIds: string[];
  }) => {
    setAppliedRouteIds(payload.routeIds);
    setAppliedTripIds(payload.tripIds);
    setCurrentPage(0);
  };

  const handleResetFilter = () => {
    setAppliedRouteIds([]);
    setAppliedTripIds([]);
    setCurrentPage(0);
  };

  const handleViewDetail = (id: string) => {
    setSelectedVehicle({
      id,
      isOpen: true,
    });
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
      <VehicleFilter
        onApplyFilter={handleApplyFilter}
        onReset={handleResetFilter}
      />

      {isRefetching && (
        <Badge
          variant="secondary"
          className="w-fit gap-1.5 py-1.5 px-3 font-normal"
        >
          <Loader2 className="size-3.5 animate-spin shrink-0" />
          {'Memperbarui data...'}
        </Badge>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {!isLoading &&
          vehicles &&
          vehicles.length > 0 &&
          vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} onViewDetail={handleViewDetail} />
          ))}

        {!isLoading && (!vehicles || vehicles.length === 0) && (
          <div className="col-span-full min-h-dvh flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 px-4 py-12 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Tidak ada data kendaraan
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Coba ubah filter rute/trip atau tunggu sebentar.
            </p>
          </div>
        )}

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

      <DialogDetail
        isOpen={selectedVehicle.isOpen}
        onClose={() => setSelectedVehicle({ id: '', isOpen: false })}
        vehicleId={selectedVehicle.id}
        vehicleDetail={vehicleDetail}
        isLoading={isVehicleDetailLoading}
        isFetching={isVehicleDetailFetching}
        isRefetching={isVehicleDetailRefetching}
        onRefresh={() => refetchVehicleDetail()}
      />
    </div>
  );
};

export default ContainerVehicleList;
