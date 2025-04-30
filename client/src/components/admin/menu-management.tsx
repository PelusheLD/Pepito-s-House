import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MenuItem, Category, insertMenuItemSchema, insertCategorySchema } from "@shared/schema";
import { formatPrice, slugify } from "@/lib/utils";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search,
  PlusCircle,
  Pencil,
  Trash2,
  UtensilsCrossed,
  CheckCircle,
  XCircle,
  Tag,
} from "lucide-react";

// Extended schema with validation
const menuItemFormSchema = insertMenuItemSchema
  .extend({
    categoryId: z.coerce.number().min(1, "Selecciona una categoría"),
    price: z.coerce.number().min(0.01, "El precio debe ser mayor que cero"),
  });

const categoryFormSchema = insertCategorySchema.extend({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
});

type MenuItemFormValues = z.infer<typeof menuItemFormSchema>;
type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function MenuManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("items");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState<boolean>(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Fetch menu items
  const { 
    data: menuItems, 
    isLoading: isLoadingItems,
    isError: isItemsError
  } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Fetch categories
  const { 
    data: categories, 
    isLoading: isLoadingCategories, 
    isError: isCategoriesError
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Setup form for menu item
  const itemForm = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      image: "",
      ingredients: "",
      categoryId: 0,
      isAvailable: true,
      isFeatured: false,
    },
  });

  // Setup form for category
  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  // Add / Edit Menu Item Mutation
  const menuItemMutation = useMutation({
    mutationFn: async (values: MenuItemFormValues) => {
      if (editingItemId) {
        // Update existing item
        const res = await apiRequest("PUT", `/api/menu-items/${editingItemId}`, values);
        return await res.json();
      } else {
        // Create new item
        const res = await apiRequest("POST", "/api/menu-items", values);
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items/featured"] });
      setIsItemDialogOpen(false);
      setEditingItemId(null);
      itemForm.reset();
      toast({
        title: editingItemId ? "Plato actualizado" : "Plato añadido",
        description: editingItemId
          ? "El plato ha sido actualizado correctamente."
          : "El nuevo plato ha sido añadido al menú.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo ${editingItemId ? "actualizar" : "añadir"} el plato: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Add / Edit Category Mutation
  const categoryMutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      if (editingCategoryId) {
        // Update existing category
        const res = await apiRequest("PUT", `/api/categories/${editingCategoryId}`, values);
        return await res.json();
      } else {
        // Create new category
        const res = await apiRequest("POST", "/api/categories", values);
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsCategoryDialogOpen(false);
      setEditingCategoryId(null);
      categoryForm.reset();
      toast({
        title: editingCategoryId ? "Categoría actualizada" : "Categoría añadida",
        description: editingCategoryId
          ? "La categoría ha sido actualizada correctamente."
          : "La nueva categoría ha sido añadida al menú.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo ${editingCategoryId ? "actualizar" : "añadir"} la categoría: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete Menu Item Mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/menu-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items/featured"] });
      setItemToDelete(null);
      toast({
        title: "Plato eliminado",
        description: "El plato ha sido eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar el plato: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Toggle Availability Mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: async (item: MenuItem) => {
      const res = await apiRequest("PUT", `/api/menu-items/${item.id}`, { 
        isAvailable: !item.isAvailable 
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items/featured"] });
      toast({
        title: "Estado actualizado",
        description: "La disponibilidad del plato ha sido actualizada correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar la disponibilidad: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete Category Mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setCategoryToDelete(null);
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar la categoría: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter menu items based on search term
  const filteredMenuItems = menuItems?.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditItem = (item: MenuItem) => {
    setEditingItemId(item.id);
    itemForm.reset({
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      ingredients: item.ingredients,
      categoryId: item.categoryId || 0,
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
    });
    setIsItemDialogOpen(true);
  };

  const handleAddItem = () => {
    setEditingItemId(null);
    itemForm.reset({
      name: "",
      description: "",
      price: 0,
      image: "",
      ingredients: "",
      categoryId: 0,
      isAvailable: true,
      isFeatured: false,
    });
    setIsItemDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    categoryForm.reset({
      name: category.name,
      slug: category.slug,
    });
    setIsCategoryDialogOpen(true);
  };

  const handleAddCategory = () => {
    setEditingCategoryId(null);
    categoryForm.reset({
      name: "",
      slug: "",
    });
    setIsCategoryDialogOpen(true);
  };

  const handleItemSubmit = (values: MenuItemFormValues) => {
    menuItemMutation.mutate(values);
  };

  const handleCategorySubmit = (values: CategoryFormValues) => {
    // Auto-generate slug if empty
    if (!values.slug) {
      values.slug = slugify(values.name);
    }
    categoryMutation.mutate(values);
  };

  const handleDeleteItem = () => {
    if (itemToDelete) {
      deleteItemMutation.mutate(itemToDelete.id);
    }
  };

  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete.id);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    categoryForm.setValue("name", name);
    
    if (!editingCategoryId || !categoryForm.getValues("slug")) {
      categoryForm.setValue("slug", slugify(name));
    }
  };

  // Generate a category name by ID
  const getCategoryName = (categoryId: number | null | undefined) => {
    if (!categoryId || !categories) return "Sin categoría";
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "Sin categoría";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display font-bold mb-6">Gestión de Menú</h2>
        <p className="text-muted-foreground mb-8">
          Añade, edita o elimina los platos y categorías de tu menú.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="items" className="flex items-center">
            <UtensilsCrossed className="mr-2 h-4 w-4" />
            Platos
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center">
            <Tag className="mr-2 h-4 w-4" />
            Categorías
          </TabsTrigger>
        </TabsList>

        {/* Menu Items Tab */}
        <TabsContent value="items">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Platos del Menú</CardTitle>
                <CardDescription>
                  Gestiona los platos que aparecen en tu menú.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar platos..."
                    className="pl-8 w-[200px] md:w-[260px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleAddItem}
                  className="whitespace-nowrap"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Plato
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingItems ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-start p-4 border rounded-md">
                      <Skeleton className="h-16 w-16 rounded-md mr-4" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                      <Skeleton className="h-9 w-20 ml-2" />
                    </div>
                  ))}
                </div>
              ) : isItemsError ? (
                <div className="text-center py-10 text-muted-foreground">
                  Error al cargar los platos. Intenta de nuevo más tarde.
                </div>
              ) : filteredMenuItems && filteredMenuItems.length > 0 ? (
                <div className="space-y-4">
                  {filteredMenuItems.map((item) => (
                    <div 
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md hover:bg-accent/20 transition-colors"
                    >
                      <div className="flex items-start flex-1">
                        <div className="h-16 w-16 rounded-md overflow-hidden mr-4 flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h3 className="font-medium">{item.name}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-primary">
                                {formatPrice(item.price)}
                              </span>
                              <span className="text-xs text-muted-foreground border px-2 py-0.5 rounded-full">
                                {getCategoryName(item.categoryId)}
                              </span>
                              {item.isAvailable ? (
                                <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                  <CheckCircle className="h-3 w-3 mr-1" /> Disponible
                                </span>
                              ) : (
                                <span className="flex items-center text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                  <XCircle className="h-3 w-3 mr-1" /> No Disponible
                                </span>
                              )}
                              {item.isFeatured && (
                                <span className="flex items-center text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                                  ⭐ Destacado
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 sm:mt-0">
                        <Button 
                          size="sm" 
                          variant={item.isAvailable ? "destructive" : "outline"}
                          className="flex-1 sm:flex-none"
                          onClick={() => {
                            const res = confirm(
                              item.isAvailable 
                                ? `¿Deseas marcar "${item.name}" como NO DISPONIBLE? No se mostrará en el menú.` 
                                : `¿Deseas marcar "${item.name}" como DISPONIBLE? Se mostrará en el menú.`
                            );
                            if (res) {
                              toggleAvailabilityMutation.mutate(item);
                            }
                          }}
                        >
                          {item.isAvailable 
                            ? <><XCircle className="h-4 w-4 mr-1" /> No Disponible</>
                            : <><CheckCircle className="h-4 w-4 mr-1" /> Disponible</>
                          }
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 sm:flex-none"
                          onClick={() => handleEditItem(item)}
                        >
                          <Pencil className="h-4 w-4 mr-1" /> Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="flex-1 sm:flex-none"
                          onClick={() => setItemToDelete(item)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  {searchTerm 
                    ? "No se encontraron platos que coincidan con la búsqueda."
                    : "No hay platos en el menú. Añade algunos para comenzar."
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Categorías del Menú</CardTitle>
                <CardDescription>
                  Gestiona las categorías para organizar tu menú.
                </CardDescription>
              </div>
              <Button onClick={handleAddCategory}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Categoría
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingCategories ? (
                <div className="space-y-4">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                      <Skeleton className="h-5 w-40" />
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : isCategoriesError ? (
                <div className="text-center py-10 text-muted-foreground">
                  Error al cargar las categorías. Intenta de nuevo más tarde.
                </div>
              ) : categories && categories.length > 0 ? (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md hover:bg-accent/20 transition-colors"
                    >
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          /{category.slug}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-4 sm:mt-0">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1 sm:flex-none"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Pencil className="h-4 w-4 mr-1" /> Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="flex-1 sm:flex-none"
                          onClick={() => setCategoryToDelete(category)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No hay categorías definidas. Añade algunas para organizar tu menú.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Menu Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItemId ? "Editar Plato" : "Añadir Nuevo Plato"}</DialogTitle>
          </DialogHeader>
          <Form {...itemForm}>
            <form onSubmit={itemForm.handleSubmit(handleItemSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={itemForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Plato</FormLabel>
                      <FormControl>
                        <Input placeholder="Paella Valenciana" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={itemForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="19.99" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={itemForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Una descripción detallada del plato..." 
                        className="resize-none" 
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={itemForm.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredientes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Arroz, pollo, azafrán, pimientos rojos, guisantes..." 
                        className="resize-none" 
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={itemForm.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de la Imagen</FormLabel>
                    <FormControl>
                      <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Ingresa la URL de una imagen del plato.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={itemForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={itemForm.control}
                  name="isAvailable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-md border">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Disponible</FormLabel>
                        <FormDescription>
                          Marca si este plato está disponible actualmente.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={itemForm.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-md border">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Destacado</FormLabel>
                        <FormDescription>
                          Marca para incluir en "Menú del Día".
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={menuItemMutation.isPending}
                >
                  {menuItemMutation.isPending ? (
                    <>
                      <div className="spinner h-4 w-4 mr-2 animate-spin border-2 border-primary border-t-transparent rounded-full" />
                      Guardando...
                    </>
                  ) : (
                    editingItemId ? "Actualizar Plato" : "Añadir Plato"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategoryId ? "Editar Categoría" : "Añadir Nueva Categoría"}</DialogTitle>
          </DialogHeader>
          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit(handleCategorySubmit)} className="space-y-4">
              <FormField
                control={categoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Categoría</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Entrantes, Postres, etc." 
                        {...field} 
                        onChange={handleNameChange} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={categoryForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="entrantes" {...field} />
                    </FormControl>
                    <FormDescription>
                      Identificador único para la URL. Se genera automáticamente si lo dejas en blanco.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 sm:gap-0 mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={categoryMutation.isPending}
                >
                  {categoryMutation.isPending ? (
                    <>
                      <div className="spinner h-4 w-4 mr-2 animate-spin border-2 border-primary border-t-transparent rounded-full" />
                      Guardando...
                    </>
                  ) : (
                    editingCategoryId ? "Actualizar Categoría" : "Añadir Categoría"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Item Alert Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar este plato?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El plato "{itemToDelete?.name}" será eliminado permanentemente del menú.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteItemMutation.isPending ? (
                <>
                  <div className="spinner h-4 w-4 mr-2 animate-spin border-2 border-destructive-foreground border-t-transparent rounded-full" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Alert Dialog */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar esta categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La categoría "{categoryToDelete?.name}" será eliminada permanentemente.
              Los platos asociados a esta categoría quedarán sin categoría asignada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCategoryMutation.isPending ? (
                <>
                  <div className="spinner h-4 w-4 mr-2 animate-spin border-2 border-destructive-foreground border-t-transparent rounded-full" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
