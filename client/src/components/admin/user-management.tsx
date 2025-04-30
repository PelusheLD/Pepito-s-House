import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User } from "@shared/schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  UserPlus,
  UserCog,
  Trash2,
  UserRound,
  Save,
  Lock,
  AlertTriangle,
  ShieldAlert
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// User form schema for creation
const userFormSchema = z.object({
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function UserManagement() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);

  // Fetch users data
  const { 
    data: users, 
    isLoading, 
    isError 
  } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Form for adding new user
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (values: Omit<UserFormValues, "confirmPassword">) => {
      const res = await apiRequest("POST", "/api/users", values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      form.reset();
      setIsAddDialogOpen(false);
      toast({
        title: "Éxito",
        description: "Usuario creado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo crear el usuario: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, password }: { id: number, password: string }) => {
      const res = await apiRequest("POST", `/api/users/${id}/reset-password`, { password });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setSelectedUser(null);
      setIsResetPasswordDialogOpen(false);
      toast({
        title: "Éxito",
        description: "Contraseña restablecida correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo restablecer la contraseña: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/users/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setSelectedUser(null);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Éxito",
        description: "Usuario eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar el usuario: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleAddClick = () => {
    form.reset({
      username: "",
      password: "",
      confirmPassword: "",
    });
    setIsAddDialogOpen(true);
  };

  const handleResetPasswordClick = (user: User) => {
    setSelectedUser(user);
    setIsResetPasswordDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const handleResetPassword = () => {
    if (selectedUser && form.getValues().password) {
      resetPasswordMutation.mutate({
        id: selectedUser.id,
        password: form.getValues().password
      });
    }
  };

  const onSubmit = (values: UserFormValues) => {
    const { confirmPassword, ...userValues } = values;
    createUserMutation.mutate(userValues);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold mb-2">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">
            Administra los usuarios con acceso al panel de administración.
          </p>
        </div>
        <Button onClick={handleAddClick} className="flex items-center">
          <UserPlus className="mr-2 h-4 w-4" />
          Crear Usuario
        </Button>
      </div>

      <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Importante</AlertTitle>
        <AlertDescription>
          Los usuarios creados aquí tendrán acceso completo al panel de administración. 
          Sólo crea cuentas para personas autorizadas.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Usuarios Administradores
          </CardTitle>
          <CardDescription>
            Lista de todos los usuarios con acceso al panel de administración.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center p-6 text-muted-foreground">
              Ocurrió un error al cargar los usuarios. Intenta de nuevo más tarde.
            </div>
          ) : users && users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex flex-col sm:flex-row justify-between p-4 border rounded-lg hover:bg-accent/10 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserRound className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{user.username}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <ShieldAlert className="h-4 w-4 mr-1" />
                        Administrador
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleResetPasswordClick(user)}
                      className="flex items-center"
                    >
                      <Lock className="mr-1 h-4 w-4" />
                      Resetear Contraseña
                    </Button>
                    {user.username !== "admin" && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteClick(user)}
                        className="flex items-center"
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Eliminar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 border rounded-lg bg-accent/10">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium mb-1">No hay usuarios registrados</h3>
              <p className="text-muted-foreground mb-4">
                Agrega usuarios administradores para darles acceso al panel.
              </p>
              <Button onClick={handleAddClick} className="flex items-center mx-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                Crear Usuario
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <UserPlus className="mr-2 h-5 w-5" />
              Crear Nuevo Usuario
            </DialogTitle>
            <DialogDescription>
              Crea un nuevo usuario con acceso al panel de administración.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="usuario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormDescription>
                      Mínimo 6 caracteres.
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
                    <FormLabel>Confirmar Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Este usuario tendrá acceso completo al panel de administración.
                </AlertDescription>
              </Alert>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancelar
                </Button>

                <Button 
                  type="submit"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? (
                    <>
                      <div className="spinner h-4 w-4 mr-2 animate-spin border-2 border-primary-foreground border-t-transparent rounded-full" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Crear Usuario
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Lock className="mr-2 h-5 w-5" />
              Restablecer Contraseña
            </DialogTitle>
            <DialogDescription>
              Establece una nueva contraseña para {selectedUser?.username}.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormDescription>
                      Mínimo 6 caracteres.
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
                    <FormLabel>Confirmar Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Alert className="bg-primary/10 border-primary/20">
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription>
                  Al restablecer la contraseña, el usuario deberá iniciar sesión con esta nueva contraseña.
                </AlertDescription>
              </Alert>
            </div>
          </Form>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsResetPasswordDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? (
                <>
                  <div className="spinner h-4 w-4 mr-2 animate-spin border-2 border-primary-foreground border-t-transparent rounded-full" />
                  Restableciendo...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Restablecer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center">
              <Trash2 className="mr-2 h-5 w-5" />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar al usuario "{selectedUser?.username}"?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 border rounded-md bg-destructive/10 flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UserRound className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{selectedUser?.username}</h3>
              <p className="text-sm text-muted-foreground">Administrador</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <>
                  <div className="spinner h-4 w-4 mr-2 animate-spin border-2 border-primary-foreground border-t-transparent rounded-full" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}