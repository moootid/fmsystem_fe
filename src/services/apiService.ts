import axios, { AxiosError } from "axios";
import { AuthUtils } from "../lib/authUtils"; // We'll create this

const apiClient = axios.create({
  baseURL: "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
  },
});

// Interceptor to add JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = AuthUtils.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle 401 Unauthorized (e.g., token expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      AuthUtils.clearToken(); // Clear stored token
      // Redirect to login using a mechanism outside the service
      // (e.g., trigger state update in AuthContext)
      // Or simply let the ProtectedRoute handle the redirect
      window.location.href = "/login"; // Simple redirect, better handled via state/router
      console.error("Unauthorized access - Redirecting to login");
    }
    // Rethrow the error for components/hooks to handle
    return Promise.reject(error);
  }
);

// --- API Function Definitions ---

// Auth
export const login = (data: LoginPayload): Promise<LoginResponse> =>
  apiClient.post("/login", data).then((res:any) => res.data).catch((error) => {
    console.error("Login error:", error);
    throw error; // Rethrow for component handling
  })
export const register = (data: RegisterPayload): Promise<void> =>
  apiClient.post("/register", data).then((res:any) => res.data); // Assuming no specific response body needed

// API Auth Tokens
export const getApiAuthTokens = (): Promise<ApiAuthToken[]> =>
  apiClient.get("/api_auth").then((res:any) => res ); // Adjust based on actual API response structure
export const createApiAuthToken = (
  data: CreateApiAuthTokenPayload
): Promise<ApiAuthToken> =>
  apiClient.post("/api_auth", data).then((res:any) => res );

// Vehicles
export const getVehicles = async ()=>
  await apiClient.get("/vehicles").then((res:any) => res);
export const createVehicle = (data: CreateVehiclePayload): Promise<Vehicle> =>
  apiClient.post("/vehicles", data).then((res:any) => res );
// Optional simplified fetch for selects
export const getVehiclesForSelect = (): Promise<SelectOption[]> =>
  apiClient.get("/vehicles?fields=id,code,plate").then((res:any) =>
    res .map((v: any) => ({
      value: v.id,
      label: `${v.code} (${v.plate})`,
    }))
  ); // Adapt based on API capabilities

// IoT Devices
export const getIotDevices = (): Promise<IotDevice[]> =>
  apiClient.get("/iot").then((res:any) => res );
export const createIotDevice = (
  data: CreateIotDevicePayload
): Promise<IotDevice> =>
  apiClient.post("/iot", data).then((res:any) => res );
// Optional simplified fetch for selects
export const getApiAuthForSelect = (): Promise<SelectOption[]> =>
  apiClient.get("/api_auth?fields=id,title").then((res:any) =>
    res .map((t: any) => ({ value: t.id, label: t.title }))
  ); // Adapt based on API capabilities

// --- Type Definitions (Define these based on your Elixir API) ---
// Example types - Adjust precisely to your API contracts
interface LoginPayload {
  email: string;
  password?: string; // Optional if using other methods
}
interface LoginResponse {
  token: string;
  user: { id: string; email: string; role: "user" | "admin" };
}
interface RegisterPayload {
  email: string;
  password?: string;
}
interface ApiAuthToken {
  id: string;
  title: string;
  description: string | null;
  token_prefix: string; // Example: Display prefix only
  last_accessed_at: string | null;
  created_at: string;
  iot_devices_count: number;
}
interface CreateApiAuthTokenPayload {
  title: string;
  description?: string;
}
interface Vehicle {
  id: string;
  code: string;
  plate: string;
  vin: string | null;
  manufacturer: string | null;
  model: string | null;
  year: number | null;
  status: string;
  type: string | null;
  color: string | null;
  iot_devices_count: number;
  latest_telemetry: {
    lat: number | null;
    long: number | null;
    timestamp: string | null;
  } | null;
}
interface CreateVehiclePayload {
  // Define fields needed for creation
  code: string;
  plate: string;
  // ... other fields
}
interface IotDevice {
  id: string;
  mac_address: string;
  model: string | null;
  hw_version: string | null;
  sw_version: string | null;
  status: string;
  vehicle: { id: string; code: string; plate: string } | null; // Example nested data
  api_auth_token: { id: string; title: string } | null; // Example nested data
}
interface CreateIotDevicePayload {
  mac_address: string;
  vehicle_id?: string; // Send IDs
  api_auth_token_id?: string;
  // ... other fields
}
interface SelectOption {
  value: string;
  label: string;
}

// Add more specific error handling/typing as needed
export const handleApiError = (
  error: unknown,
  toastFn: (options: any) => void
) => {
  let title = "An error occurred";
  let description = "Please try again later.";

  if (axios.isAxiosError(error)) {
    title = `Error: ${error.response?.status || "Network Error"}`;
    // Try to get specific error messages from the backend response
    const responseData = error.response?.data as any; // Type assertion
    if (responseData?.errors) {
      // Handle structured validation errors (common in Elixir/Phoenix)
      description = Object.entries(responseData.errors)
        .map(([field, messages]) => `${field} ${(messages as string[]).join(", ")}`)
        .join("; ");
    } else if (responseData?.message) {
      description = responseData.message;
    } else if (error.message) {
      description = error.message;
    }
  } else if (error instanceof Error) {
    description = error.message;
  }

  toastFn({
    variant: "destructive",
    title: title,
    description: description,
  });

  // Return structured errors for form handling if needed
  if (axios.isAxiosError(error) && error.response?.data?.errors) {
    return error.response.data.errors;
  }
  return null;
};

export default {
  login,
  register,
  getApiAuthTokens,
  createApiAuthToken,
  getVehicles,
  createVehicle,
  getIotDevices,
  createIotDevice,
  getVehiclesForSelect, // Export optional helpers
  getApiAuthForSelect, // Export optional helpers
  handleApiError, // Export error handler utility
};
