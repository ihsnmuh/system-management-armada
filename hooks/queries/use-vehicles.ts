import { useQuery } from '@tanstack/react-query';
import { vehicleApi, vehicleKeys } from '@/lib/api/endpoints/vehicles';
import type { PaginationParams } from '@/types/api';

// Fetch vehicles with pagination
export function useVehicles(params?: PaginationParams) {
  return useQuery({
    queryKey: vehicleKeys.list(params),
    queryFn: () => vehicleApi.getAll(params),
    refetchInterval: 0.1 * 60 * 1000, // refetch setiap 0.5 menit
  });
}
