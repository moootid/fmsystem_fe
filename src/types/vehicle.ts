// src/types/vehicle.ts

/**
 * Represents the structure of a Vehicle object as returned by the API.
 */
export interface Vehicle {
    id: string;
    code: string;
    plate: string;
    vin: string | null;
    manufacturer: string | null;
    model: string | null;
    year: number | null;
    status: string; // Consider using a union type if statuses are fixed: 'Active' | 'Maintenance' | 'Inactive'
    type: string | null;
    color: string | null;
    iot_devices_count: number;
    latest_telemetry: {
      lat: string | null;
      long: string | null;
      timestamp: string | null; // ISO 8601 string format is common
    } | null;
    // Add other fields returned by your API if necessary
    // created_at?: string;
    // updated_at?: string;
  }
  
  /**
   * Represents the payload required to create a new Vehicle via the API.
   * Adjust required/optional fields based on your API endpoint requirements.
   */
  export interface CreateVehiclePayload {
    code: string; // Typically required
    plate: string; // Typically required
    vin: string; // Marked as required in the form logic
    manufacturer?: string;
    model?: string;
    year?: number;
    status?: string;
    type?: string;
    color?: string;
    // Fields like iot_devices_count and latest_telemetry are usually set by the backend,
    // but included here if your API allows setting them on creation (uncommon).
    // iot_devices_count?: number;
    // latest_telemetry?: {
    //   lat: number | null;
    //   long: number | null;
    //   timestamp: string | null;
    // } | null;
  }
  
  /**
   * Represents the payload allowed when updating an existing Vehicle via the API.
   * Often a partial version of the Vehicle type, excluding read-only fields like 'id'.
   */
  export interface UpdateVehiclePayload extends Partial<Omit<Vehicle, 'id' | 'iot_devices_count' | 'latest_telemetry'>> {
    // Ensure required fields for update (if any) are not optional here,
    // or handle validation appropriately in the form/API.
    // For example, if 'code' cannot be changed after creation, omit it:
    // extends Partial<Omit<Vehicle, 'id' | 'code' | 'iot_devices_count' | 'latest_telemetry'>>
  
    // Explicitly define fields if they differ significantly from Vehicle type
    code?: string;
    plate?: string;
    vin?: string;
    manufacturer?: string;
    model?: string;
    year?: number;
    status?: string;
    type?: string;
    color?: string;
  }
  
  
  /**
   * Represents the structure of validation errors returned from the API,
   * typically mapping field names to an array of error messages.
   * Example: { "code": ["Code already exists."], "plate": ["Plate format is invalid."] }
   */
  export interface ApiValidationError {
    [field: string]: string[];
  }
  
  /**
   * Represents the structure of a successful API response containing a single vehicle.
   * Adjust based on your actual API response structure.
   */
  export interface SingleVehicleApiResponse {
      data: Vehicle;
      message?: string; // Optional success message
      // Add other potential top-level response fields
  }
  
  /**
   * Represents the structure of a successful API response containing a list of vehicles.
   * Adjust based on your actual API response structure (e.g., pagination info).
   */
  export interface VehicleListApiResponse {
      data: Vehicle[];
      message?: string; // Optional success message
      meta?: { // Example pagination metadata
          currentPage: number;
          totalPages: number;
          perPage: number;
          totalItems: number;
      };
      // Add other potential top-level response fields
  }
  