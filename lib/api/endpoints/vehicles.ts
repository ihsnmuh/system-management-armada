import { apiClient } from '../client';
import type {
  Vehicle,
  ApiListResponse,
  PaginationParams,
} from '@/types/api';

// Endpoints
const ENDPOINTS = {
  BASE: '/vehicles',
} as const;

// Helper: build query string dari params
function buildQuery(params?: PaginationParams): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  if (params.limit !== undefined) {
    searchParams.set('page[limit]', String(params.limit));
  }

  if (params.offset !== undefined) {
    searchParams.set('page[offset]', String(params.offset));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

// Query Keys - include params supaya cache per-page
export const vehicleKeys = {
  all: ['vehicles'] as const,
  list: (params?: PaginationParams) => ['vehicles', 'list', params] as const,
};

// API Functions
export const vehicleApi = {
  getAll: (params?: PaginationParams) =>
    apiClient<ApiListResponse<Vehicle>>(
      `${ENDPOINTS.BASE}${buildQuery(params)}`,
    ),
};
