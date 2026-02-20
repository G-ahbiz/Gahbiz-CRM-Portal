import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/api-response';
import { ToastService } from '@core/services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorFacadeService {
  private toastService = inject(ToastService);

  /**
   * Handle API Response errors and extract error message
   */
  handleApiResponse<T>(response: ApiResponse<T>): string {
    if (response.message) {
      return response.message;
    }
    if (response.errors && response.errors.length > 0) {
      return response.errors[0];
    }
    return 'An error occurred while processing your request';
  }

  /**
   * Handle HTTP errors and extract error message
   */
  handleHttpError(error: HttpErrorResponse): string {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // First, check if there's an errors array and use the first error
      if (
        error.error?.errors &&
        Array.isArray(error.error.errors) &&
        error.error.errors.length > 0
      ) {
        errorMessage = error.error.errors[0];
      } else if (error.error?.message) {
        // Fall back to the message property
        errorMessage = error.error.message;
      } else {
        // Finally, use status-specific messages
        switch (error.status) {
          case 400:
            errorMessage = 'Invalid request data';
            break;
          case 401:
            errorMessage = 'Invalid credentials';
            break;
          case 403:
            errorMessage = 'Access forbidden';
            break;
          case 404:
            errorMessage = 'Service not found';
            break;
          case 409:
            errorMessage =
              typeof error.error === 'string'
                ? error.error
                : 'A resource with this data already exists';
            break;
          case 500:
            errorMessage = 'Server error occurred';
            break;
          default:
            errorMessage = `Error Code: ${error.status}`;
        }
      }
    }

    return errorMessage;
  }

  /**
   * Extract error message(s) from any error type without displaying
   */
  getErrorMessage(error: any): string | string[] {
    if (error instanceof HttpErrorResponse && error.error) {
      const apiError = error.error as ApiResponse<any>;

      if (apiError.errors?.length > 0) {
        return apiError.errors;
      }

      if (apiError.message) {
        return apiError.message;
      }
    }

    return 'An unexpected error occurred';
  }

  /**
   * Universal error handler that displays error via toast
   */
  showError(error: any): void {
    let errorMessage: string;

    if (error instanceof HttpErrorResponse) {
      errorMessage = this.handleHttpError(error);
    } else if (error && typeof error === 'object' && 'succeeded' in error) {
      errorMessage = this.handleApiResponse(error as ApiResponse<any>);
    } else if (error?.message) {
      errorMessage = error.message;
    } else {
      errorMessage = 'An unexpected error occurred';
    }

    this.toastService.error(errorMessage);
  }
}
