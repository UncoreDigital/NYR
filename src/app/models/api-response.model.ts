export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface ApiError {
  message: string;
  status: number;
  errors?: string[];
}
