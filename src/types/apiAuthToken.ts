// src/types/apiAuthToken.ts

export interface ApiAuthToken {
    id: string;
    title: string;
    description: string | null;
    token_prefix: string; // Example: Display prefix only
    last_accessed_at: string | null; // ISO 8601 string
    created_at: string; // ISO 8601 string
    iot_devices_count: number;
  }
  
  export interface CreateApiAuthTokenPayload {
    title: string;
    description?: string;
  }
  
  // Add UpdateApiAuthTokenPayload if needed
  // export interface UpdateApiAuthTokenPayload extends Partial<Omit<ApiAuthToken, 'id' | 'token_prefix' | 'created_at' | 'iot_devices_count'>> {
  //   // Define specific updatable fields
  // }
  