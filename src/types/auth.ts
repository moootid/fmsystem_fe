// src/types/auth.ts

export interface LoginPayload {
    email: string;
    password?: string; // Optional if using other auth methods
  }
  
  export interface LoginResponse {
    token: string;
    user: {
      id: string;
      email: string;
      role: "user" | "admin"; // Use union type for known roles
    };
  }
  
  export interface RegisterPayload {
    email: string;
    password?: string;
  }
  
  // No specific RegisterResponse defined, assuming API returns 2xx with no body or a simple message
  