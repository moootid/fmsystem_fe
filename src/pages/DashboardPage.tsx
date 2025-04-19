import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Car, Router, KeyRound, UserCog } from "lucide-react";

interface DashboardAction {
  title: string;
  description: string;
  link: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  const actions: DashboardAction[] = [
    {
      title: "Manage Vehicles",
      description: "View, add, or edit vehicle information.",
      link: "/vehicles",
      icon: Car,
    },
    {
      title: "Manage IoT Devices",
      description: "Configure and monitor your IoT devices.",
      link: "/iot",
      icon: Router,
    },
    {
      title: "Manage API Tokens",
      description: "Generate and manage access tokens for APIs.",
      link: "/api-auth",
      icon: KeyRound,
    },
  ];

  // Filter actions based on user role (show all if admin, otherwise filter out adminOnly)
  const availableActions = actions.filter(
    (action) => !action.adminOnly || isAdmin,
  );

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Welcome back, {user?.email || "User"}! Access your resources below.
        </p>
        {isAdmin && (
          <p className="mt-1 text-sm font-medium text-primary flex items-center">
            <UserCog className="h-4 w-4 mr-1.5" />
            Administrator Access Enabled
          </p>
        )}
      </div>

      {availableActions.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {availableActions.map((action) => (
            <Link
              to={action.link}
              key={action.link}
              className="group block"
            >
              <Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:border-primary/60 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold tracking-tight">
                    {action.title}
                  </CardTitle>
                  <action.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No actions available for your role.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
