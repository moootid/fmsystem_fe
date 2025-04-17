import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { useAuthStore } from "@/stores/authStore";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
// import ApiAuthPage from "@/pages/ApiAuthPage";
import VehiclesPage from "@/pages/VehiclesPage";
// import IotPage from "@/pages/IotPage";
import { Toaster } from "@/components/ui/sonner"; // Shadcn Toaster
import { ThemeProvider } from "./components/theme-provider";

// import LoadingSpinner from "@/components/shared/LoadingSpinner"; // Create this component

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false, // Optional: Adjust as needed
    },
  },
});

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isLoadingAuth = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoadingAuth) {
    // Show a full-page loader while checking auth status
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<DashboardPage />} />
              {/* <Route path="/api-auth" element={<ApiAuthPage />} /> */}
              <Route path="/vehicles" element={<VehiclesPage />} />
              {/* <Route path="/iot" element={<IotPage />} /> */}
              {/* Add other protected routes here */}
            </Route>

            {/* Catch-all or Not Found Route (Optional) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Toaster /> {/* Add Shadcn Toaster here */}
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </ThemeProvider>
  );
}

// Layout for protected routes
function ProtectedLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // You might want a brief loading state here too if auth check is async on navigation
  // const isLoading = useAuthStore((state) => state.isLoading);
  // if (isLoading) return <LoadingSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render the nested routes (the actual page component)
  // You can add a common layout wrapper here (Navbar, Sidebar, etc.)
  return (
    <div className="flex min-h-screen flex-col">
      {/* Example: <Navbar /> */}
      <main className="flex-grow p-4 md:p-8">
        <Outlet /> {/* Renders the matched child route component */}
      </main>
      {/* Example: <Footer /> */}
    </div>
  );
}

// Basic Loading Spinner Component (`src/components/shared/LoadingSpinner.tsx`)
// You can customize this further
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
}
const LoadingSpinner = ({ size = "md" }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };
  return (
    <div
      className={`animate-spin rounded-full border-4 border-primary border-t-transparent ${sizeClasses[size]}`}
      role="status"
      aria-label="Loading..."
    ></div>
  );
};

export default App;
