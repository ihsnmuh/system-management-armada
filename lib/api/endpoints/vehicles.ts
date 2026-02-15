import { apiClient } from '../client';
import type {
  Vehicle,
  Route,
  ApiListResponse,
  PaginationParams,
  FilterParams,
} from '@/types/api';

// Endpoints
const ENDPOINTS = {
  BASE: '/vehicles',
} as const;

// Helper: build query string dari params
function buildQuery(params?: PaginationParams & FilterParams): string {
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

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

// Query Keys - include params supaya cache per-page
export const vehicleKeys = {
  all: ['vehicles'] as const,
  list: (params?: PaginationParams & FilterParams) => ['vehicles', 'list', params] as const,
};

// API Functions
export const vehicleApi = {
  getAll: (params?: PaginationParams & FilterParams) =>
    apiClient<ApiListResponse<Vehicle, Route>>(
      `${ENDPOINTS.BASE}${buildQuery(params)}`,
    ),
};
