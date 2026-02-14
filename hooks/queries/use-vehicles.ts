import { useQuery } from '@tanstack/react-query';
import { vehicleApi, vehicleKeys } from '@/lib/api/endpoints/vehicles';

// Fetch all vehicles
export function useVehicles() {
  return useQuery({
    queryKey: vehicleKeys.all,
    queryFn: vehicleApi.getAll,
  });
}