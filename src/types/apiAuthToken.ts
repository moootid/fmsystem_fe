// src/types/apiAuthToken.ts

import { IotDevice } from "./iotDevice";

export interface ApiAuthToken {
    id: string;
    title: string;
    description: string | null;
    token: string; // Example: Display prefix only
    last_accessed_at: string | null; // ISO 8601 string
    inserted_at: string; // ISO 8601 string
    iot_devices: IotDevice[]; // Assuming this is an array of IotDevice objects
  }
  
  export interface CreateApiAuthTokenPayload {
    title: string;
    description?: string;
  }
  
  // Add UpdateApiAuthTokenPayload if needed
  // export interface UpdateApiAuthTokenPayload extends Partial<Omit<ApiAuthToken, 'id' | 'token_prefix' | 'created_at' | 'iot_devices_count'>> {
  //   // Define specific updatable fields
  // }
  