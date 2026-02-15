export interface Route {
  attributes: RouteAttributes;
  id: string;
  links: RouteLinks;
  relationships: RouteRelationships;
  type: string;
}

export interface RouteAttributes {
  color: string;
  description: string;
  direction_destinations: (string | null)[];
  direction_names: (string | null)[];
  fare_class: string;
  listed_route: boolean;
  long_name: string;
  short_name: string;
  sort_order: number;
  text_color: string;
  type: number;
}

export interface RouteLinks {
  self: string;
}

export interface RouteRelationships {
  agency: RouteAgency;
  line: RouteLine;
}

export interface RouteAgency {
  data: RouteRelationshipData;
}

export interface RouteLine {
  data: RouteRelationshipData;
}

export interface RouteRelationshipData {
  id: string;
  type: string;
}
