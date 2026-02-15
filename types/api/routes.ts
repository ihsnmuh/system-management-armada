export interface Route {
  attributes: RouteAttributes;
  id: string;
  links: RouteLinks;
  relationships: RouteRelationships;
  type: 'route';
}

export interface RouteAttributes {
  color: string;
  description: string;
  direction_destinations: string[];
  direction_names: string[];
  fare_class: string;
  listed_route: boolean;
  long_name: string;
  short_name: string;
  sort_order: number;
  text_color: string;
  /** 0=Light Rail, 1=Heavy Rail, 2=Commuter Rail, 3=Bus, 4=Ferry */
  type: number;
}

export interface RouteLinks {
  self: string;
}

export interface RouteRelationships {
  agency: RouteAgencyRelationship;
  line: RouteLineRelationship;
  route_patterns?: RoutePatternsRelationship;
}

export interface RouteAgencyRelationship {
  data: RouteRelationshipData;
}

export interface RouteLineRelationship {
  data: RouteRelationshipData;
}

export interface RoutePatternsRelationship {
  data: RouteRelationshipData[];
}

export interface RouteRelationshipData {
  id: string;
  type: string;
}

/** Params untuk filter GET /routes (MBTA API) */
export interface RouteFilterParams {
  sort?: string;
  fields?: string;
  include?: string; // route_patterns, line, stop
  filterStop?: string;
  filterType?: string; // 0,1,2,3,4 (Light Rail, Heavy Rail, Commuter Rail, Bus, Ferry)
  filterDirectionId?: string;
  filterDate?: string; // YYYY-MM-DD
  filterId?: string;
  filterListedRoute?: 'true' | 'false';
}
