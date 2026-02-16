export interface Trip {
  attributes: TripAttributes;
  id: string;
  links: TripLinks;
  relationships: TripRelationships;
  type: 'trip';
}

export interface TripAttributes {
  name?: string;
  direction_id: number;
  headsign: string | null;
  block_id?: string | null;
  wheelchair_accessible?: number;
  bikes_allowed?: number;
}

export interface TripLinks {
  self: string;
}

export interface TripRelationships {
  route: TripRouteRelationship;
}

export interface TripRouteRelationship {
  data: TripRelationshipData;
}

export interface TripRelationshipData {
  id: string;
  type: string;
}

/** Params untuk filter GET /trips (MBTA API) */
export interface TripFilterParams {
  sort?: string;
  fields?: string;
  include?: string;
  filterRoute?: string;
  filterDate?: string;
  filterId?: string;
  filterDirectionId?: string;
}

/** Params untuk GET /trips/:id (detail) — include relationship (mis. shape) */
export interface TripDetailParams {
  include?: string;
}
