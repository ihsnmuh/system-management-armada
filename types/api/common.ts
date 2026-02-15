// MBTA JSON:API response format
export interface ApiResponse<T> {
  data: T;
  links?: PaginationLinks;
}

export interface ApiListResponse<T, I = T> {
  data: T[];
  included?: I[];
  jsonapi?: JsonApi;
  links?: PaginationLinks;
}

export interface JsonApi {
  version: string;
}

export interface PaginationLinks {
  first?: string;
  last?: string;
  next?: string | null;
  prev?: string | null;
}

// Pagination params untuk query
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface FilterParams {
  include?: string;
}