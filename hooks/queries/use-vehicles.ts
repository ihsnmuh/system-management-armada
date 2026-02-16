import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vehicleApi, vehicleKeys } from '@/lib/api/endpoints/vehicles';
import type {
  FilterParams,
  PaginationParams,
  VehicleFilterParams,
} from '@/types/api';
import type { Trip } from '@/types/api';

type UseVehiclesParams = PaginationParams & FilterParams & VehicleFilterParams;

export function useVehicles(params?: UseVehiclesParams) {
  return useQuery({
    queryKey: vehicleKeys.list(params),
    queryFn: () => vehicleApi.getAll(params),
    refetchInterval: 0.5 * 60 * 1000, // refetch setiap 0.5 menit
  });
}

export function useVehicleById(id: string) {
  return useQuery({
    queryKey: vehicleKeys.getById(id),
    queryFn: () => vehicleApi.getById(id),
    enabled: !!id,
  });
}

const VEHICLES_FOR_TRIPS_LIMIT = 200;

/**
 * Trip untuk dropdown dari kendaraan aktif (bukan dari /trips).
 * GET /vehicles?filter[route]=...&include=trip → hanya trip yang punya kendaraan.
 */
export function useTripsFromVehicles(routeIds: string[] | undefined) {
  const filterRoute =
    routeIds && routeIds.length > 0 ? routeIds.join(',') : undefined;
  const { data, isLoading } = useQuery({
    queryKey: [...vehicleKeys.all, 'trips-from-vehicles', { filterRoute }] as const,
    queryFn: () =>
      vehicleApi.getAll({
        filterRoute,
        include: 'trip',
        limit: VEHICLES_FOR_TRIPS_LIMIT,
      }),
    enabled: !!filterRoute,
    refetchInterval: 0.5 * 60 * 1000,
  });

  const trips = useMemo((): Trip[] => {
    if (!data?.data) return [];
    const vehicles = data.data;
    const included = (data as { included?: Array<{ type: string; id: string; attributes: Trip['attributes']; relationships?: Trip['relationships']; links?: Trip['links'] }> }).included ?? [];
    const tripIds = [...new Set(
      vehicles
        .map((v) => v.relationships?.trip?.data?.id)
        .filter((id): id is string => Boolean(id)),
    )];
    const tripById = new Map(
      included
        .filter((x) => x.type === 'trip')
        .map((t) => [
          t.id,
          {
            id: t.id,
            type: 'trip' as const,
            attributes: t.attributes,
            relationships: t.relationships ?? { route: { data: { id: '', type: 'route' } } },
            links: t.links ?? { self: '' },
          } satisfies Trip,
        ]),
    );
    return tripIds
      .map((id) => tripById.get(id))
      .filter((t): t is Trip => t != null);
  }, [data]);

  return { trips, isLoading };
}
