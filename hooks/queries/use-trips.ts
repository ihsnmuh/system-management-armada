import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { tripApi, tripKeys } from '@/lib/api/endpoints/trips';
import type {
  FilterParams,
  PaginationParams,
  TripFilterParams,
  Trip,
} from '@/types/api';

type TripListParams = PaginationParams & FilterParams & TripFilterParams;

const TRIPS_PAGE_SIZE = 30;

export function useTrips(params?: TripListParams) {
  return useQuery({
    queryKey: tripKeys.list(params),
    queryFn: () => tripApi.getAll(params),
  });
}

function todayDateString(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function useTripsInfinite(
  pageSize = TRIPS_PAGE_SIZE,
  params?: Omit<TripListParams, 'limit' | 'offset'>,
) {
  const result = useInfiniteQuery({
    queryKey: [...tripKeys.all, 'infinite', { pageSize, params }] as const,
    queryFn: ({ pageParam }) =>
      tripApi.getAll({
        ...params,
        filterDate: params?.filterDate ?? todayDateString(),
        limit: pageSize,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.data.length < pageSize) return undefined;
      return allPages.length * pageSize;
    },
    initialPageParam: 0,
  });

  const trips: Trip[] = result.data?.pages.flatMap((p) => p.data) ?? [];
  return { ...result, trips };
}
