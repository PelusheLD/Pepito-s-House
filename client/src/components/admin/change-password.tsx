import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, AlertTriangle, CheckCircle2, LogOut } from "lucide-react";

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

interface ChangePasswordProps {
  isFirstLogin?: boolean;
}

function LogoutModal({ open, onConfirm }: { open: boolean; onConfirm: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center animate-fade-in">
        <div className="flex flex-col items-center gap-2 mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-600 mb-2" />
          <h2 className="text-xl font-bold mb-1">¡Contraseña actualizada!</h2>
          <p className="text-gray-600">Por seguridad, tu sesión se cerrará.<br />Haz clic en <b>OK</b> para continuar.</p>
        </div>
        <Button onClick={onConfirm} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700">
          <LogOut className="h-5 w-5" /> OK, cerrar sesión
        </Button>
      </div>
    </div>
  );
}

export default function ChangePassword({ isFirstLogin = false }: ChangePasswordProps) {
  const { changePasswordMutation, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const form = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (changePasswordMutation.isSuccess) {
      form.reset();
      setShowLogoutModal(true);
    }
  }, [changePasswordMutation.isSuccess, form]);

  const handleLogout = () => {
    setShowLogoutModal(false);
    logoutMutation.mutate();
    setLocation('/auth');
  };

  const onSubmit = (values: PasswordChangeFormValues) => {
    changePasswordMutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  };

  return (
    <div className="max-w-md mx-auto">
      <LogoutModal open={showLogoutModal} onConfirm={handleLogout} />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isFirstLogin ? "Cambiar Contraseña Inicial" : "Cambiar Contraseña"}
          </CardTitle>
          <CardDescription>
            {isFirstLogin 
              ? "Para continuar, es necesario cambiar la contraseña predeterminada por una contraseña personal."
              : "Actualiza tu contraseña para mantener tu cuenta segura."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFirstLogin && (
            <Alert className="mb-6 bg-yellow-50 text-yellow-800 border-yellow-200">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Primer inicio de sesión detectado</AlertTitle>
              <AlertDescription>
                Por motivos de seguridad, es necesario cambiar la contraseña predeterminada antes de continuar.
              </AlertDescription>
            </Alert>
          )}

          {changePasswordMutation.isSuccess && (
            <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-5 w-5" />
              <AlertTitle>¡Contraseña actualizada!</AlertTitle>
              <AlertDescription>
                Tu contraseña ha sido actualizada correctamente.
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña actual</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="********" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      {isFirstLogin && "Para el primer inicio, la contraseña predeterminada es 'admin123'."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva contraseña</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="********" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Debe tener al menos 6 caracteres.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar nueva contraseña</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="********" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit"
                className="w-full"
                disabled={changePasswordMutation.isPending || changePasswordMutation.isSuccess}
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <div className="spinner h-4 w-4 mr-2 animate-spin border-2 border-primary-foreground border-t-transparent rounded-full" />
                    Cambiando contraseña...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Cambiar Contraseña
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            {isFirstLogin 
              ? "Una vez actualizada tu contraseña, podrás acceder a todas las funciones del panel." 
              : "Mantén tu contraseña segura y cámbiala regularmente."
            }
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
