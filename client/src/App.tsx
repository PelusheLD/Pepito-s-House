import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AdminPage from "@/pages/admin-page";
import { ProtectedRoute } from "./lib/protected-route";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { CartProvider } from "./hooks/use-cart";
import { AuthProvider } from "./hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/admin-aut" component={AuthPage} />
      <ProtectedRoute path="/admin-aut/:section" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
