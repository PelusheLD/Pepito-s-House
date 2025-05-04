import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldAlert } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const { user, isLoading, loginMutation } = useAuth();
  const [location, setLocation] = useLocation();

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !isLoading) {
      setLocation(user.isFirstLogin ? "/admin-aut/change-password" : "/admin-aut");
    }
  }, [user, isLoading, setLocation]);

  function onLoginSubmit(data: LoginValues) {
    loginMutation.mutate(data);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is already logged in, don't show the auth page
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/10 p-4">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-2">
        <div className="flex flex-col justify-center p-6 rounded-xl bg-white/70 backdrop-blur-md shadow-lg">
          <Card>
            <CardHeader>
              <CardTitle>Panel Administrativo</CardTitle>
              <CardDescription>
                Inicia sesión para acceder al panel de administración del restaurante.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usuario</FormLabel>
                        <FormControl>
                          <Input placeholder="usuario" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6 pt-6 border-t text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <ShieldAlert size={16} />
                  <p>Solo los administradores pueden acceder a esta área.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="hidden lg:flex lg:flex-col relative overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-zinc-900/70 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80" 
            alt="Restaurant Interior" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white p-12 text-center">
            <h2 className="text-4xl font-display font-bold mb-6">Panel Administrativo LLAMAS!</h2>
            <p className="text-lg">
              Administra tu restaurante, gestiona el menú, actualiza información del personal, y personaliza la experiencia de tus clientes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
