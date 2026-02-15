import { useQuery } from '@tanstack/react-query';
import { vehicleApi, vehicleKeys } from '@/lib/api/endpoints/vehicles';
import type { FilterParams, PaginationParams } from '@/types/api';

// Fetch vehicles with pagination
export function useVehicles(params?: PaginationParams & FilterParams) {
  return useQuery({
    queryKey: vehicleKeys.list(params),
    queryFn: () => vehicleApi.getAll(params),
    refetchInterval: 0.5 * 60 * 1000, // refetch setiap 0.5 menit
  });
}
