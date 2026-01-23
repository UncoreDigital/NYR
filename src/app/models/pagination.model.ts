export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
}

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
