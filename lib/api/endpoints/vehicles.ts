import { apiClient } from '../client';
import type { Vehicle, ApiResponse, PaginatedResponse } from '@/types/api';

// Endpoints
const ENDPOINTS = {
  BASE: '/vehicles',
  BY_ID: (id: string) => `${ENDPOINTS.BASE}/${id}`,
} as const;

// Query Keys
export const vehicleKeys = {
  all: ['vehicles'] as const,
  detail: (id: string) => ['vehicles', id] as const,
};

// API Functions
export const vehicleApi = {
  getAll: () =>
    apiClient<PaginatedResponse<Vehicle>>(ENDPOINTS.BASE),
};
