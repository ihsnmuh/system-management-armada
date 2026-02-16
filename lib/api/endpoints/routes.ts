import { apiClient } from '../client';
import type {
  Route,
  ApiListResponse,
  PaginationParams,
  FilterParams,
  RouteFilterParams,
} from '@/types/api';

// Endpoints
const ENDPOINTS = {
  BASE: '/routes',
} as const;

type RouteListParams = PaginationParams & FilterParams & RouteFilterParams;

function buildQuery(params?: RouteListParams): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  if (params.limit !== undefined) {
    searchParams.set('page[limit]', String(params.limit));
  }

  if (params.offset !== undefined) {
    searchParams.set('page[offset]', String(params.offset));
  }

  if (params.include !== undefined) {
    searchParams.set('include', params.include);
  }

  if (params.sort !== undefined) {
    searchParams.set('sort', params.sort);
  }

  if (params.fields !== undefined) {
    searchParams.set('fields[route]', params.fields);
  }

  if (params.filterStop !== undefined) {
    searchParams.set('filter[stop]', params.filterStop);
  }

  if (params.filterType !== undefined) {
    searchParams.set('filter[type]', params.filterType);
  }

  if (params.filterDirectionId !== undefined) {
    searchParams.set('filter[direction_id]', params.filterDirectionId);
  }

  if (params.filterDate !== undefined) {
    searchParams.set('filter[date]', params.filterDate);
  }

  if (params.filterId !== undefined) {
    searchParams.set('filter[id]', params.filterId);
  }

  if (params.filterListedRoute !== undefined) {
    searchParams.set('filter[listed_route]', params.filterListedRoute);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const routeKeys = {
  all: ['routes'] as const,
  list: (params?: RouteListParams) => ['routes', 'list', params] as const,
};

export const routeApi = {
  getAll: (params?: RouteListParams) =>
    apiClient<ApiListResponse<Route>>(`${ENDPOINTS.BASE}${buildQuery(params)}`),
};
