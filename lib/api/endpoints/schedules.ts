import { apiClient } from '../client';
import type {
  Schedule,
  ApiListResponse,
  ApiDetailResponse,
  PaginationParams,
  FilterParams,
  ScheduleFilterParams,
  ScheduleDetailParams,
  Stop,
} from '@/types/api';

const ENDPOINTS = {
  BASE: '/schedules',
} as const;

type ScheduleListParams = PaginationParams &
  FilterParams &
  ScheduleFilterParams;

function buildDetailQuery(params?: ScheduleDetailParams): string {
  if (!params?.include) return '';
  const searchParams = new URLSearchParams();
  searchParams.set('include', params.include);
  return `?${searchParams.toString()}`;
}

function buildQuery(params?: ScheduleListParams): string {
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
    searchParams.set('fields[schedule]', params.fields);
  }

  if (params.filterRoute !== undefined) {
    searchParams.set('filter[route]', params.filterRoute);
  }

  if (params.filterTrip !== undefined) {
    searchParams.set('filter[trip]', params.filterTrip);
  }

  if (params.filterStop !== undefined) {
    searchParams.set('filter[stop]', params.filterStop);
  }

  if (params.filterDate !== undefined) {
    searchParams.set('filter[date]', params.filterDate);
  }

  if (params.filterDirectionId !== undefined) {
    searchParams.set('filter[direction_id]', params.filterDirectionId);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const scheduleKeys = {
  all: ['schedules'] as const,
  list: (params?: ScheduleListParams) => ['schedules', 'list', params] as const,
  getById: (id: string, params?: ScheduleDetailParams) =>
    ['schedules', 'getById', id, params] as const,
};

const SCHEDULE_DETAIL_INCLUDE = 'stop';

export const scheduleApi = {
  getAll: (params?: ScheduleListParams) =>
    apiClient<ApiListResponse<Schedule, Stop>>(
      `${ENDPOINTS.BASE}${buildQuery(params)}`,
    ),
  getById: (id: string, params?: ScheduleDetailParams) =>
    apiClient<ApiDetailResponse<Schedule, Record<string, unknown>>>(
      `${ENDPOINTS.BASE}/${id}${buildDetailQuery(
        params ?? { include: SCHEDULE_DETAIL_INCLUDE },
      )}`,
    ),
};
