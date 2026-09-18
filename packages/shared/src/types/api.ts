export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
