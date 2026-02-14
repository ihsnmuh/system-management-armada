// MBTA JSON:API response format
export interface ApiResponse<T> {
  data: T;
  links?: PaginationLinks;
}

export interface ApiListResponse<T> {
  data: T[];
  links?: PaginationLinks;
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
