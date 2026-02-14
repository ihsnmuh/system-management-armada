export interface Vehicle {
  attributes: VehicleAttributes;
  id: string;
  links: VehicleLinks;
  relationships: VehicleRelationships;
  type: string;
}

export interface VehicleAttributes {
  bearing: number;
  carriages: VehicleCarriage[];
  current_status: string;
  current_stop_sequence: number;
  direction_id: number;
  label: string;
  latitude: number;
  longitude: number;
  occupancy_status: unknown;
  revenue: string;
  speed: unknown;
  updated_at: string;
}

export interface VehicleCarriage {
  label: string;
  occupancy_status: string;
  occupancy_percentage: unknown;
}

export interface VehicleLinks {
  self: string;
}

export interface VehicleRelationships {
  route: VehicleRoute;
  stop: VehicleStop;
  trip: VehicleTrip;
}

export interface VehicleRoute {
  data: RelationshipData;
}

export interface VehicleStop {
  data: RelationshipData;
}

export interface VehicleTrip {
  data: RelationshipData;
}

export interface RelationshipData {
  id: string;
  type: string;
}
