import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Staff, InsertStaff } from "@shared/schema";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  UserPlus,
  UserCog,
  Trash2,
  Save,
  UserRound
} from "lucide-react";

// Staff form schema
const staffFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  position: z.string().min(2, "El cargo debe tener al menos 2 caracteres"),
  bio: z.string().min(10, "La biografía debe tener al menos 10 caracteres"),
  image: z.string().url("La URL de la imagen no es válida").or(z.string().length(0)),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

export default function StaffManagement() {
  const { toast } = useToast();
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch staff data
  const { 
    data: staff, 
    isLoading, 
    isError 
  } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Form for adding/editing staff
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: "",
      position: "",
      bio: "",
      image: "",
    },
    values: selectedStaff ? {
      name: selectedStaff.name,
      position: selectedStaff.position,
      bio: selectedStaff.bio,
      image: selectedStaff.image || "",
    } : {
      name: "",
      position: "",
      bio: "",
      image: "",
    }
  });

  // Create staff mutation
  const createStaffMutation = useMutation({
    mutationFn: async (values: InsertStaff) => {
      const res = await apiRequest("POST", "/api/staff", values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      form.reset();
      setIsAddDialogOpen(false);
      toast({
        title: "Éxito",
        description: "Miembro del personal agregado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo agregar el miembro del personal: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update staff mutation
  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: Partial<Staff> }) => {
      const res = await apiRequest("PUT", `/api/staff/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      setSelectedStaff(null);
      setIsEditing(false);
      toast({
        title: "Éxito",
        description: "Miembro del personal actualizado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el miembro del personal: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete staff mutation
  const deleteStaffMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/staff/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      setSelectedStaff(null);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Éxito",
        description: "Miembro del personal eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar el miembro del personal: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleEditClick = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsEditing(true);
  };

  const handleDeleteClick = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsDeleteDialogOpen(true);
  };

  const handleAddClick = () => {
    form.reset({
      name: "",
      position: "",
      bio: "",
      image: "",
    });
    setIsAddDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedStaff) {
      deleteStaffMutation.mutate(selectedStaff.id);
    }
  };

  const onSubmit = (values: StaffFormValues) => {
    if (isEditing && selectedStaff) {
      updateStaffMutation.mutate({
        id: selectedStaff.id,
        updates: values
      });
    } else {
      createStaffMutation.mutate(values);
    }
  };

  // Eliminado el método getPositionIcon para no mostrar iconos al lado de los cargos

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold mb-2">Gestión de Personal</h2>
          <p className="text-muted-foreground">
            Agrega, edita o elimina miembros del personal que aparecerán en la sección "Nuestro Equipo".
          </p>
        </div>
        <Button onClick={handleAddClick} className="flex items-center">
          <UserPlus className="mr-2 h-4 w-4" />
          Agregar Personal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Miembros del Equipo
          </CardTitle>
          <CardDescription>
            Lista de todo el personal que aparece en el sitio web.
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
              Ocurrió un error al cargar el personal. Intenta de nuevo más tarde.
            </div>
          ) : staff && staff.length > 0 ? (
            <div className="space-y-4">
              {staff.map((member) => (
                <div key={member.id} className="flex flex-col sm:flex-row justify-between p-4 border rounded-lg hover:bg-accent/10 transition-colors">
                  <div className="flex items-center space-x-4">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserRound className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      <div className="text-sm text-muted-foreground">
                        {member.position}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditClick(member)}
                      className="flex items-center"
                    >
                      <UserCog className="mr-1 h-4 w-4" />
                      Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteClick(member)}
                      className="flex items-center"
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 border rounded-lg bg-accent/10">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium mb-1">No hay personal registrado</h3>
              <p className="text-muted-foreground mb-4">
                Agrega miembros del personal para mostrarlos en la sección "Nuestro Equipo"
              </p>
              <Button onClick={handleAddClick} className="flex items-center mx-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                Agregar Personal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Staff Dialog */}
      <Dialog open={isEditing || isAddDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsEditing(false);
          setIsAddDialogOpen(false);
        }
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {isEditing ? (
                <>
                  <UserCog className="mr-2 h-5 w-5" />
                  Editar Miembro del Personal
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Agregar Nuevo Miembro del Personal
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Actualiza la información del miembro del personal seleccionado." 
                : "Completa el formulario para agregar un nuevo miembro al equipo."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input placeholder="Chef Principal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografía</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Breve descripción de la experiencia y especialidad de esta persona..." 
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>
                      Una breve biografía que destaque su experiencia y especialidad.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de Imagen</FormLabel>
                    <FormControl>
                      <Input placeholder="https://ejemplo.com/foto.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL de una imagen de perfil (opcional).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("image") && (
                <div className="p-4 border rounded-md bg-accent/20">
                  <p className="text-sm font-medium mb-2">Vista previa de la imagen:</p>
                  <div className="flex items-center gap-4">
                    <img 
                      src={form.watch("image")} 
                      alt="Preview" 
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{form.watch("name") || "Nombre"}</p>
                      <p className="text-sm text-muted-foreground">{form.watch("position") || "Cargo"}</p>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setIsAddDialogOpen(false);
                  }}
                >
                  Cancelar
                </Button>

                <Button 
                  type="submit"
                  disabled={createStaffMutation.isPending || updateStaffMutation.isPending}
                >
                  {(createStaffMutation.isPending || updateStaffMutation.isPending) ? (
                    <>
                      <div className="spinner h-4 w-4 mr-2 animate-spin border-2 border-primary-foreground border-t-transparent rounded-full" />
                      {isEditing ? "Actualizando..." : "Guardando..."}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditing ? "Actualizar" : "Guardar"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
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
              ¿Estás seguro de que deseas eliminar a {selectedStaff?.name}?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 border rounded-md bg-destructive/10 flex items-center space-x-4">
            {selectedStaff?.image ? (
              <img
                src={selectedStaff.image}
                alt={selectedStaff.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UserRound className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <h3 className="font-medium">{selectedStaff?.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedStaff?.position}</p>
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
              disabled={deleteStaffMutation.isPending}
            >
              {deleteStaffMutation.isPending ? (
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