// API Response Types
export interface ApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  timestamp?: string;
  path?: string;
  errorCode?: string;

}

// Pagination Meta
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}


