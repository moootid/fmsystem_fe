import { create } from "zustand";
import { AuthUtils, User } from "@/lib/authUtils";
import apiService from "../services/apiService"; // Import your API service

// Define the type for login credentials
interface LoginPayload {
  email: string; // Or username, depending on your API
  password: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // For initial auth check
  login: (credentials: LoginPayload) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void; // Function to check token on app load
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Start loading initially

  initializeAuth: () => {
    const token = AuthUtils.getToken();
    if (token) {
      const decoded = AuthUtils.decodeToken(token);
      if (decoded) {
        set({
          user: decoded.user,
          token: token,
          isAuthenticated: true,
          isLoading: false,
        });
        return; // Exit if valid token found
      } else {
        // Token exists but is invalid/expired
        AuthUtils.clearToken();
      }
    }
    // No valid token found
    set({ isLoading: false });
  },

  login: async (credentials) => {
    try {
      const { token, user } = await apiService.auth.login(credentials);
      AuthUtils.setToken(token);
      set({ user, token, isAuthenticated: true });
    } catch (error) {
      console.error("Login failed:", error);
      AuthUtils.clearToken(); // Ensure token is cleared on failed login attempt
      set({ user: null, token: null, isAuthenticated: false });
      // Re-throw the error so the component can display a message
      throw error;
    }
  },

  logout: () => {
    AuthUtils.clearToken();
    set({ user: null, token: null, isAuthenticated: false });
    // Optionally redirect here or let the ProtectedRoute handle it
    // window.location.href = '/login';
  },
}));

// Call initializeAuth when the store is first used/app loads
// This can be done in your main App component or layout
// useAuthStore.getState().initializeAuth(); // Or call within a useEffect
