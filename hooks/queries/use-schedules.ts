import { useQuery } from '@tanstack/react-query';
import { scheduleApi, scheduleKeys } from '@/lib/api/endpoints/schedules';
import type {
  FilterParams,
  PaginationParams,
  ScheduleFilterParams,
  ScheduleDetailParams,
} from '@/types/api';

type ScheduleListParams = PaginationParams &
  FilterParams &
  ScheduleFilterParams;

export function useSchedules(params?: ScheduleListParams) {
  return useQuery({
    queryKey: scheduleKeys.list(params),
    queryFn: () => scheduleApi.getAll(params),
    enabled: !!params?.filterTrip,
  });
}

export function useScheduleDetail(id: string, params?: ScheduleDetailParams) {
  return useQuery({
    queryKey: scheduleKeys.getById(id, params),
    queryFn: () => scheduleApi.getById(id, params),
    enabled: !!id,
  });
}
