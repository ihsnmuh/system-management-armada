import { apiClient } from '../client';
import type {
  Trip,
  ApiListResponse,
  PaginationParams,
  FilterParams,
  TripFilterParams,
} from '@/types/api';

const ENDPOINTS = {
  BASE: '/trips',
} as const;

type TripListParams = PaginationParams & FilterParams & TripFilterParams;

function buildQuery(params?: TripListParams): string {
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
    searchParams.set('fields[trip]', params.fields);
  }

  if (params.filterRoute !== undefined) {
    searchParams.set('filter[route]', params.filterRoute);
  }

  if (params.filterDate !== undefined) {
    searchParams.set('filter[date]', params.filterDate);
  }

  if (params.filterId !== undefined) {
    searchParams.set('filter[id]', params.filterId);
  }

  if (params.filterDirectionId !== undefined) {
    searchParams.set('filter[direction_id]', params.filterDirectionId);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const tripKeys = {
  all: ['trips'] as const,
  list: (params?: TripListParams) => ['trips', 'list', params] as const,
};

export const tripApi = {
  getAll: (params?: TripListParams) =>
    apiClient<ApiListResponse<Trip>>(
      `${ENDPOINTS.BASE}${buildQuery(params)}`,
    ),
};
