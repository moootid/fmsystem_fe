// src/types/iotDevice.ts

// Forward declaration for nested types to avoid circular dependencies if needed later
// interface VehicleSummary { id: string; code: string; plate: string; }
// interface ApiAuthTokenSummary { id: string; title: string; }

export interface IotDevice {
    id: string;
    mac_address: string;
    model: string | null;
    hw_version: string | null;
    sw_version: string | null;
    status: string; // Consider 'Online' | 'Offline' | 'Provisioning' etc.
    // Define nested structures based on what your API actually returns
    vehicle: { id: string; code: string; plate: string } | null;
    api_auth_token: { id: string; title: string } | null;
    // created_at?: string; // ISO 8601 string
    // updated_at?: string; // ISO 8601 string
  }
  
  export interface CreateIotDevicePayload {
    mac_address: string;
    vehicle_id?: string | null; // Use null if API expects it for unlinking
    api_auth_token_id?: string | null;
    model?: string;
    hw_version?: string;
    sw_version?: string;
    status?: string;
  }
  
  export interface UpdateIotDevicePayload extends Partial<Omit<IotDevice, 'id' | 'vehicle' | 'api_auth_token'>> {
    vehicle_id?: string | null; // Allow updating links
    api_auth_token_id?: string | null;
    // Define other specific updatable fields
  }
  