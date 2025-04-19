// src/types/api.ts

/**
 * Generic structure for dropdown/select options.
 */
export interface SelectOption {
    value: string;
    label: string;
  }
  
  /**
   * Structure for structured validation errors from the API.
   * Example: { "field_name": ["error message 1", "error message 2"] }
   */
  export interface ApiValidationError {
    [field: string]: string[];
  }
  
  /**
   * Structure for a generic error response from the API.
   */
  export interface ApiErrorResponse {
    message?: string;
    errors?: ApiValidationError;
    // Add other potential error fields your API might return
  }
  