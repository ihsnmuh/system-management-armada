import { apiClient } from '../client';
import type {
  Vehicle,
  Route,
  Trip,
  ApiListResponse,
  ApiDetailResponse,
  PaginationParams,
  FilterParams,
  VehicleFilterParams,
  VehicleDetailParams,
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

function buildDetailQuery(params?: VehicleDetailParams): string {
  if (!params?.include) return '';
  const searchParams = new URLSearchParams();
  searchParams.set('include', params.include);
  return `?${searchParams.toString()}`;
}

export const vehicleKeys = {
  all: ['vehicles'] as const,
  list: (params?: VehicleListParams) => ['vehicles', 'list', params] as const,
  getById: (id: string, params?: VehicleDetailParams) =>
    ['vehicles', 'getById', id, params] as const,
};

const VEHICLE_DETAIL_INCLUDE = 'route,trip,stop';

export const vehicleApi = {
  getAll: (params?: VehicleListParams) =>
    apiClient<ApiListResponse<Vehicle, Route>>(
      `${ENDPOINTS.BASE}${buildQuery(params)}`,
    ),
  getById: (id: string, params?: VehicleDetailParams) =>
    apiClient<
      ApiDetailResponse<Vehicle, Route | Trip | Record<string, unknown>>
    >(
      `${ENDPOINTS.BASE}/${id}${buildDetailQuery(
        params ?? { include: VEHICLE_DETAIL_INCLUDE },
      )}`,
    ),
};
