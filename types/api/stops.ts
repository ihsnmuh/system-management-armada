export interface Stop {
  attributes: StopAttributes;
  id: string;
  links: StopLinks;
  relationships?: StopRelationships;
  type: 'stop';
}

export interface StopAttributes {
  address: string | null;
  at_street: string | null;
  description: string | null;
  latitude: number;
  location_type: number;
  longitude: number;
  municipality: string | null;
  name: string;
  on_street: string | null;
  platform_code: string | null;
  platform_name: string | null;
  vehicle_type?: number;
  wheelchair_boarding?: number;
}

export interface StopLinks {
  self: string;
}

export interface StopRelationships {
  parent_station?: { data: { id: string; type: string } | null };
  zone?: { data: { id: string; type: string } | null };
}
