export interface ApiResponse<T> {
  statusCode: number;
  succeeded: boolean;
  message: string;
  errors: string[];
  data: T;
}
