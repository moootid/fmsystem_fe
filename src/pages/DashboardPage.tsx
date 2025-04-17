import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom"; // Import Link for navigation

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.email || "User"}!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This is your main dashboard. You can navigate to other sections
            using the links below (or a navigation bar if you add one).
          </p>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Link
              to="/vehicles"
              className="text-primary hover:underline"
            >
              Manage Vehicles
            </Link>
            <Link
              to="/iot"
              className="text-primary hover:underline"
            >
              Manage IoT Devices
            </Link>
            <Link
              to="/api-auth"
              className="text-primary hover:underline"
            >
              Manage API Tokens
            </Link>
            {/* Add more links as needed */}
          </div>
          {user?.role === "admin" && (
            <p className="mt-4 text-sm text-muted-foreground">
              You are logged in as an Administrator.
            </p>
          )}
        </CardContent>
      </Card>
      {/* Add more dashboard components/widgets here later */}
    </div>
  );
}
