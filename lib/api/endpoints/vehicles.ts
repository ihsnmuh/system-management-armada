import { apiClient } from '../client';
import type {
  Vehicle,
  Route,
  ApiListResponse,
  PaginationParams,
  FilterParams,
  VehicleFilterParams,
} from '@/types/api';

const ENDPOINTS = {
  BASE: '/vehicles',
} as const;

type VehicleListParams = PaginationParams & FilterParams & VehicleFilterParams;

function buildQuery(params?: VehicleListParams): string {
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

  if (params.filterRoute !== undefined) {
    searchParams.set('filter[route]', params.filterRoute);
  }

  if (params.filterTrip !== undefined) {
    searchParams.set('filter[trip]', params.filterTrip);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const vehicleKeys = {
  all: ['vehicles'] as const,
  list: (params?: VehicleListParams) => ['vehicles', 'list', params] as const,
};

export const vehicleApi = {
  getAll: (params?: VehicleListParams) =>
    apiClient<ApiListResponse<Vehicle, Route>>(
      `${ENDPOINTS.BASE}${buildQuery(params)}`,
    ),
};
