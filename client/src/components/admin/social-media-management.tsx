import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { SocialMedia } from "@shared/schema";
import { Pencil, Plus, Save, Trash2, Trash, X } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLinkedin, FaTiktok, FaWhatsapp, FaStar } from "react-icons/fa";

const socialMediaFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  url: z.string().url("Ingresa una URL válida").min(1, "La URL es requerida"),
  icon: z.string().min(1, "El icono es requerido"),
  isActive: z.boolean().default(true),
});

type SocialMediaFormValues = z.infer<typeof socialMediaFormSchema>;

const socialIcons: Record<string, React.ReactNode> = {
  "facebook": <FaFacebook className="h-5 w-5 text-blue-600" />,
  "twitter": <FaTwitter className="h-5 w-5 text-blue-400" />,
  "instagram": <FaInstagram className="h-5 w-5 text-pink-500" />,
  "youtube": <FaYoutube className="h-5 w-5 text-red-600" />,
  "linkedin": <FaLinkedin className="h-5 w-5 text-blue-700" />,
  "tiktok": <FaTiktok className="h-5 w-5 text-black" />,
  "whatsapp": <FaWhatsapp className="h-5 w-5 text-green-500" />,
  "default": <FaStar className="h-5 w-5 text-yellow-500" />,
};

export default function SocialMediaManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSocialMedia, setSelectedSocialMedia] = useState<SocialMedia | null>(null);
  const queryClient = useQueryClient();

  const { data: socialMedias = [], isLoading } = useQuery({
    queryKey: ["/api/social-media"],
    queryFn: async () => {
      const res = await fetch("/api/social-media");
      if (!res.ok) throw new Error("Error fetching social media links");
      return res.json();
    },
  });

  const form = useForm<SocialMediaFormValues>({
    resolver: zodResolver(socialMediaFormSchema),
    defaultValues: {
      name: "",
      url: "",
      icon: "default",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: SocialMediaFormValues) => {
      const res = await apiRequest("POST", "/api/social-media", values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-media"] });
      toast({
        title: "Red social creada",
        description: "La red social ha sido creada exitosamente",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: SocialMediaFormValues & { id: number }) => {
      const { id, ...rest } = values;
      const res = await apiRequest("PUT", `/api/social-media/${id}`, rest);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-media"] });
      toast({
        title: "Red social actualizada",
        description: "La red social ha sido actualizada exitosamente",
      });
      setIsDialogOpen(false);
      setSelectedSocialMedia(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/social-media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-media"] });
      toast({
        title: "Red social eliminada",
        description: "La red social ha sido eliminada exitosamente",
      });
      setIsDeleteDialogOpen(false);
      setSelectedSocialMedia(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PUT", `/api/social-media/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-media"] });
      toast({
        title: "Estado actualizado",
        description: "El estado de la red social ha sido actualizado",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditClick = (socialMedia: SocialMedia) => {
    setSelectedSocialMedia(socialMedia);
    form.reset({
      name: socialMedia.name,
      url: socialMedia.url,
      icon: socialMedia.icon,
      isActive: socialMedia.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (socialMedia: SocialMedia) => {
    setSelectedSocialMedia(socialMedia);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = (values: SocialMediaFormValues) => {
    if (selectedSocialMedia) {
      updateMutation.mutate({ ...values, id: selectedSocialMedia.id });
    } else {
      createMutation.mutate(values);
    }
  };

  const getIconComponent = (iconName: string) => {
    return socialIcons[iconName.toLowerCase()] || socialIcons.default;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Redes Sociales</CardTitle>
            <CardDescription>Gestiona los enlaces a redes sociales del restaurante</CardDescription>
          </div>
          <Button onClick={() => {
            setSelectedSocialMedia(null);
            form.reset({
              name: "",
              url: "",
              icon: "default",
              isActive: true,
            });
            setIsDialogOpen(true);
          }} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Agregar Red Social
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="spinner h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : socialMedias.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="mb-2">No hay redes sociales configuradas</div>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedSocialMedia(null);
                form.reset({
                  name: "",
                  url: "",
                  icon: "default",
                  isActive: true,
                });
                setIsDialogOpen(true);
              }}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar primera red social
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Red Social</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {socialMedias.map((social: SocialMedia) => (
                <TableRow key={social.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getIconComponent(social.icon)}
                      <span>{social.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs truncate max-w-[200px]">
                    <a 
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {social.url}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={social.isActive} 
                      onCheckedChange={(checked) => 
                        toggleStatusMutation.mutate({ id: social.id, isActive: checked })
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditClick(social)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteClick(social)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedSocialMedia ? "Editar Red Social" : "Agregar Red Social"}
              </DialogTitle>
              <DialogDescription>
                {selectedSocialMedia 
                  ? "Modifica los detalles de la red social" 
                  : "Añade un nuevo enlace a redes sociales"
                }
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
                        <Input placeholder="Facebook" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nombre de la red social
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ícono</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-4 gap-2">
                          {Object.entries(socialIcons).map(([name, icon]) => (
                            <div 
                              key={name}
                              onClick={() => form.setValue("icon", name)}
                              className={`
                                flex flex-col items-center justify-center p-2 rounded-md border cursor-pointer
                                ${field.value === name ? "border-primary bg-primary/10" : "border-input"}
                              `}
                            >
                              <div className="mb-1">{icon}</div>
                              <span className="text-xs capitalize">{name}</span>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://facebook.com/mi-restaurante" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL completa incluyendo https://
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Activo</FormLabel>
                        <FormDescription>
                          Mostrar este enlace en el sitio
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <>
                        <div className="spinner h-4 w-4 mr-2 animate-spin border-2 border-primary-foreground border-t-transparent rounded-full" />
                        {selectedSocialMedia ? "Actualizando..." : "Guardando..."}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {selectedSocialMedia ? "Actualizar" : "Guardar"}
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmar eliminación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar la red social "{selectedSocialMedia?.name}"? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => selectedSocialMedia && deleteMutation.mutate(selectedSocialMedia.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <div className="spinner h-4 w-4 mr-2 animate-spin border-2 border-destructive-foreground border-t-transparent rounded-full" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash className="mr-2 h-4 w-4" />
                    Eliminar
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}