import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { routeApi, routeKeys } from '@/lib/api/endpoints/routes';
import type {
  FilterParams,
  PaginationParams,
  RouteFilterParams,
  Route,
} from '@/types/api';

type RouteListParams = PaginationParams & FilterParams & RouteFilterParams;

const ROUTES_PAGE_SIZE = 30;

export function useRoutes(params?: RouteListParams) {
  return useQuery({
    queryKey: routeKeys.list(params),
    queryFn: () => routeApi.getAll(params),
  });
}

export function useRoutesInfinite(
  pageSize = ROUTES_PAGE_SIZE,
  params?: Omit<RouteListParams, 'limit' | 'offset'>,
  options?: { enabled?: boolean },
) {
  const result = useInfiniteQuery({
    queryKey: [...routeKeys.all, 'infinite', { pageSize, params }] as const,
    queryFn: ({ pageParam }) =>
      routeApi.getAll({
        ...params,
        limit: pageSize,
        offset: pageParam,
        sort: params?.sort ?? 'long_name',
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.data.length < pageSize) return undefined;
      return allPages.length * pageSize;
    },
    initialPageParam: 0,
    enabled: options?.enabled ?? true,
  });

  const routes: Route[] = result.data?.pages.flatMap((p) => p.data) ?? [];
  return { ...result, routes };
}
