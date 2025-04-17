import { jwtDecode } from "jwt-decode"; // Correct import

const TOKEN_KEY = "authToken";

interface DecodedToken {
  exp: number;
  // Add other expected fields from your JWT payload
  sub: string; // Typically user ID
  role: "user" | "admin";
  email: string; // Assuming email is in the token
}

export interface User {
  id: string;
  email: string;
  role: "user" | "admin";
}

export const AuthUtils = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  decodeToken: (token: string): { user: User; expires: number } | null => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      // Optional: Check if token is expired client-side (backend check is primary)
      if (decoded.exp * 1000 < Date.now()) {
        console.warn("Token expired (client-side check)");
        AuthUtils.clearToken();
        return null;
      }
      const user: User = {
        id: decoded.sub,
        email: decoded.email, // Adjust field name if different in your token
        role: decoded.role,
      };
      return { user, expires: decoded.exp * 1000 };
    } catch (error) {
      console.error("Failed to decode token:", error);
      AuthUtils.clearToken(); // Clear invalid token
      return null;
    }
  },

  getUserFromToken: (): User | null => {
    const token = AuthUtils.getToken();
    if (!token) return null;
    const decoded = AuthUtils.decodeToken(token);
    return decoded ? decoded.user : null;
  },

  isAuthenticated: (): boolean => {
    const token = AuthUtils.getToken();
    if (!token) return false;
    // Optional: Basic check if token exists and is decodable (doesn't guarantee validity)
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000 >= Date.now(); // Check expiry
    } catch {
      return false;
    }
  },
};
