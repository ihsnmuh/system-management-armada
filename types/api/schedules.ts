export interface Schedule {
  id: string;
  type: 'schedule';
  attributes: ScheduleAttributes;
  relationships: ScheduleRelationships;
}

export interface ScheduleAttributes {
  arrival_time: string | null;
  departure_time: string | null;
  stop_sequence: number;
  stop_headsign: string | null;
  direction_id: number;
  pickup_type: number;
  drop_off_type: number;
  timepoint: number | null;
}

export interface ScheduleRelationships {
  trip: ScheduleRelationship;
  stop: ScheduleRelationship;
  route: ScheduleRelationship;
}

export interface ScheduleRelationship {
  data: ScheduleRelationshipData | null;
}

export interface ScheduleRelationshipData {
  id: string;
  type: string;
}

/** Params untuk filter GET /schedules (MBTA API) */
export interface ScheduleFilterParams {
  sort?: string;
  fields?: string;
  include?: string;
  filterRoute?: string;
  filterTrip?: string;
  filterStop?: string;
  filterDate?: string;
  filterDirectionId?: string;
}

/** Params untuk GET /schedules/:id (detail) — include relationship (mis. stop) */
export interface ScheduleDetailParams {
  include?: string;
}
