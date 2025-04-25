// src/services/apiService.ts
import axios, { AxiosError, AxiosResponse } from "axios";
import { AuthUtils } from "../lib/authUtils"; // Assuming this exists and works

// Import all necessary types
import type { SelectOption, ApiErrorResponse, ApiValidationError } from "@/types/api";
import type { LoginPayload, LoginResponse, RegisterPayload } from "@/types/auth";
import type { ApiAuthToken, CreateApiAuthTokenPayload } from "@/types/apiAuthToken";
import type { Vehicle, CreateVehiclePayload, UpdateVehiclePayload } from "@/types/vehicle";
import type { IotDevice, CreateIotDevicePayload, UpdateIotDevicePayload } from "@/types/iotDevice";

// Centralized API Client Configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api", // Use env variable
  headers: {
    "Content-Type": "application/json",
    // CORS headers are typically set by the *server*, not the client request
    // "Access-Control-Allow-Origin": "*", // Remove unless specifically needed and understood
    // "Access-Control-Allow-Methods": "*", // Remove
  },
  timeout: 10000, // Example: Add a request timeout
});

// --- Interceptors ---

// Request Interceptor: Add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = AuthUtils.getToken();
    // Ensure headers object exists before modification
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors like 401
apiClient.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.error("API Error: 401 Unauthorized. Token might be invalid or expired.");
      AuthUtils.clearToken();
      // Use a more robust navigation method if possible (e.g., router hook outside service)
      // This simple redirect might cause issues in complex apps or during SSR
      if (window.location.pathname !== "/login") {
         window.location.href = "/login";
      }
    }
    // Rethrow the error so specific catch blocks or React Query's onError can handle it
    return Promise.reject(error);
  }
);

// --- API Function Definitions (Grouped by Resource) ---

const authApi = {
  login: async (data: LoginPayload): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/login", data);
    return response.data; // Return only the data payload
  },

  register: async (data: RegisterPayload): Promise<void> => {
    // Assuming success is indicated by 2xx status, no specific data needed
    await apiClient.post<void>("/register", data);
  },

  // Add logout, forgotPassword, etc. if needed
};

const apiAuthTokenApi = {
  list: async (): Promise<ApiAuthToken[]> => {
    const response = await apiClient.get<ApiAuthToken[]>("/api_auth");
    return response.data;
  },

  create: async (data: CreateApiAuthTokenPayload): Promise<ApiAuthToken> => {
    const response = await apiClient.post<ApiAuthToken>("/api_auth", data);
    return response.data;
  },

  getById: async (id: string): Promise<ApiAuthToken> => {
     const response = await apiClient.get<ApiAuthToken>(`/api_auth/${id}`);
     return response.data;
  },

  delete: async (id: string): Promise<void> => {
     await apiClient.delete<void>(`/api_auth/${id}`);
  },

  // Add update if needed
  // update: async (id: string, data: UpdateApiAuthTokenPayload): Promise<ApiAuthToken> => {
  //   const response = await apiClient.put<ApiAuthToken>(`/api_auth/${id}`, data);
  //   return response.data;
  // },

  // Example: Simplified fetch for selects
  listForSelect: async (): Promise<SelectOption[]> => {
    // Adjust fields based on API capabilities
    const response = await apiClient.get<Pick<ApiAuthToken, 'id' | 'title'>[]>("/api_auth?fields=id,title");
    return response.data.map((token) => ({
      value: token.id,
      label: token.title,
    }));
  },
};

const vehicleApi = {
  list: async (): Promise<Vehicle[]> => {
    const response = await apiClient.get<Vehicle[]>("/vehicles");
    console.log(response.data)
    return response.data;
  },

  create: async (data: CreateVehiclePayload): Promise<Vehicle> => {
    const response = await apiClient.post<Vehicle>("/vehicles", data);
    return response.data;
  },

  getById: async (id: string): Promise<Vehicle> => {
    const response = await apiClient.get<Vehicle>(`/vehicles/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateVehiclePayload): Promise<Vehicle> => {
    console.log("Updating vehicle with ID:", id, "and data:", data);
    const response = await apiClient.put<Vehicle>(`/vehicles/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete<void>(`/vehicles/${id}`);
  },

  // Example: Simplified fetch for selects
  listForSelect: async (): Promise<SelectOption[]> => {
    // Adjust fields based on API capabilities
    const response = await apiClient.get<Pick<Vehicle, 'id' | 'code' | 'plate'>[]>("/vehicles?fields=id,code,plate");
    return response.data.map((v) => ({
      value: v.id,
      label: `${v.code} (${v.plate})`,
    }));
  },
};

const iotDeviceApi = {
  list: async (): Promise<IotDevice[]> => {
    const response = await apiClient.get<IotDevice[]>("/iot");
    return response.data;
  },

  create: async (data: CreateIotDevicePayload): Promise<IotDevice> => {
    const response = await apiClient.post<IotDevice>("/iot", data);
    return response.data;
  },

   getById: async (id: string): Promise<IotDevice> => {
     const response = await apiClient.get<IotDevice>(`/iot/${id}`);
     return response.data;
   },

   update: async (id: string, data: UpdateIotDevicePayload): Promise<IotDevice> => {
     const response = await apiClient.put<IotDevice>(`/iot/${id}`, data);
     return response.data;
   },

   delete: async (id: string): Promise<void> => {
     await apiClient.delete<void>(`/iot/${id}`);
   },
};

// --- Utility Functions ---

/**
 * Centralized error handler for API calls, primarily for displaying toasts.
 * @param error The error object caught (unknown type).
 * @param toastFn A function (like `toast.error`) to display the error message.
 * @returns Structured validation errors if available, otherwise null.
 */
export const handleApiError = (
  error: unknown,
  // Use a more specific type for toast options if available from your library
  toastFn: (title: string, options?: { description?: string; [key: string]: any }) => void
): ApiValidationError | null => {
  let title = "An error occurred";
  let description = "Please try again later or contact support.";
  let validationErrors: ApiValidationError | null = null;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>; // Type assertion
    const status = axiosError.response?.status;
    const responseData = axiosError.response?.data;

    title = `Error${status ? `: ${status}` : ''}`;

    if (status === 401) {
      // Already handled by interceptor, but prevent generic toast for it
      title = "Unauthorized";
      description = "Your session may have expired. Please log in again.";
      // Don't show toast here if interceptor redirects
      // toastFn(title, { description });
      return null; // Don't return validation errors for 401
    } else if (responseData) {
      // Use specific messages from API response if available
      if (responseData.message) {
        description = responseData.message;
      }
      if (responseData.errors) {
        // Format validation errors for toast description
        description = Object.entries(responseData.errors)
          .map(
            ([field, messages]) =>
              `${field}: ${messages.join(", ")}`
          )
          .join("; ");
        validationErrors = responseData.errors; // Store for form handling
        title = "Validation Error"; // More specific title
      }
    } else if (axiosError.message) {
        // Fallback to Axios error message
        description = axiosError.message;
        if (axiosError.code === 'ECONNABORTED') {
            title = "Request Timeout";
            description = "The request took too long to complete. Please check your connection and try again.";
        } else if (!axiosError.response) {
            title = "Network Error";
            description = "Could not connect to the server. Please check your network connection.";
        }
    }
  } else if (error instanceof Error) {
    // Handle non-Axios errors
    description = error.message;
    title = "Application Error";
  }

  // Display the toast notification (unless it was a 401 handled by interceptor)
  if (error && !(axios.isAxiosError(error) && error.response?.status === 401)) {
      toastFn(title, { description });
  }


  // Return validation errors for potential use in forms
  return validationErrors;
};


// --- Default Export ---
// Consolidate all API functions into a single export object
const apiService = {
  auth: authApi,
  apiAuthTokens: apiAuthTokenApi,
  vehicles: vehicleApi,
  iotDevices: iotDeviceApi,
  handleApiError, // Expose the error handler utility
};

export default apiService;
