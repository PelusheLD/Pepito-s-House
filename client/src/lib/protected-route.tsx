import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Solo redirigir a change-password si es primer login y NO estamos ya en esa página
  if (user.isFirstLogin && !location.includes("/admin-aut/change-password")) {
    return (
      <Route path={path}>
        <Redirect to="/admin-aut/change-password" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
