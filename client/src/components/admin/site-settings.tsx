import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Settings, Location } from "@shared/schema";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Settings2,
  MapPin,
  Phone,
  Mail,
  Save,
  Image,
  Clock,
  Truck,
  SquarePen,
  CalendarCheck
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Basic settings schema
const basicSettingsSchema = z.object({
  restaurantName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  restaurantLogo: z.string().url("La URL del logo no es válida"),
  heroTitle: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  heroSubtitle: z.string().min(10, "El subtítulo debe tener al menos 10 caracteres"),
  heroImage: z.string().url("La URL de la imagen no es válida"),
  reservationTitle: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  reservationDescription: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  reservationPhoneText: z.string().min(5, "El texto debe tener al menos 5 caracteres"),
  reservationConfirmationText: z.string().min(5, "El texto debe tener al menos 5 caracteres"),
  isReservationsEnabled: z.boolean()
});

// Location schema
const locationSchema = z.object({
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  phone: z.string().min(5, "El teléfono debe tener al menos 5 caracteres"),
  email: z.string().email("El correo electrónico no es válido"),
  mapCoordinates: z.string().optional(),
  hours: z.string()
});

type BasicSettingsFormValues = z.infer<typeof basicSettingsSchema>;
type LocationFormValues = z.infer<typeof locationSchema>;

export default function SiteSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("general");
  
  // Fetch settings
  const { 
    data: settings, 
    isLoading: isLoadingSettings,
    isError: isSettingsError
  } = useQuery<Settings[]>({
    queryKey: ["/api/settings"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Fetch location
  const {
    data: location,
    isLoading: isLoadingLocation,
    isError: isLocationError
  } = useQuery<Location>({
    queryKey: ["/api/location"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Helper function to get setting value
  const getSettingValue = (key: string) => {
    if (!settings) return "";
    const setting = settings.find(s => s.key === key);
    return setting ? setting.value : "";
  };

  // Set up basic settings form
  const basicSettingsForm = useForm<BasicSettingsFormValues>({
    resolver: zodResolver(basicSettingsSchema),
    defaultValues: {
      restaurantName: "",
      restaurantLogo: "",
      heroTitle: "",
      heroSubtitle: "",
      heroImage: "",
      reservationTitle: "",
      reservationDescription: "",
      reservationPhoneText: "",
      reservationConfirmationText: "",
      isReservationsEnabled: true
    },
    values: {
      restaurantName: getSettingValue("restaurantName") || "Pepito's House",
      restaurantLogo: getSettingValue("restaurantLogo") || "https://images.unsplash.com/photo-1656137002630-6da73c6d5b11?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjB8fGZpcmUlMjBsb2dvfGVufDB8fDB8fHww",
      heroTitle: getSettingValue("heroTitle") || "Una experiencia culinaria inolvidable",
      heroSubtitle: getSettingValue("heroSubtitle") || "Descubre nuestra propuesta gastronómica única, elaborada con los mejores ingredientes frescos y locales.",
      heroImage: getSettingValue("heroImage") || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80",
      reservationTitle: getSettingValue("reservationTitle") || "¡Reserva tu Mesa en Pepito's House!",
      reservationDescription: getSettingValue("reservationDescription") || "Asegura tu lugar en nuestro restaurante completando el siguiente formulario. Nuestro equipo se comunicará contigo para confirmar tu reserva y atender cualquier solicitud especial.",
      reservationPhoneText: getSettingValue("reservationPhoneText") || "¿Prefieres hacer tu reserva por teléfono? Llama al",
      reservationConfirmationText: getSettingValue("reservationConfirmationText") || "Recuerda que todas las reservas requieren confirmación. Te contactaremos vía WhatsApp para verificar los detalles.",
      isReservationsEnabled: getSettingValue("isReservationsEnabled") === "true"
    }
  });

  // Format hours from JSON if available
  const parseHours = () => {
    if (!location?.hours) return JSON.stringify({
      "Lun - Jue": "12:00pm - 10:00pm",
      "Vie - Sáb": "12:00pm - 12:00am", 
      "Domingo": "12:00pm - 9:00pm"
    });
    
    try {
      // If it's already a JSON string, just return it
      JSON.parse(location.hours);
      return location.hours;
    } catch (e) {
      // If it's not valid JSON, format it
      return JSON.stringify({
        "Lun - Jue": "12:00pm - 10:00pm",
        "Vie - Sáb": "12:00pm - 12:00am", 
        "Domingo": "12:00pm - 9:00pm"
      });
    }
  };

  // Set up location form
  const locationForm = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      address: "",
      phone: "",
      email: "",
      mapCoordinates: "",
      hours: ""
    },
    values: {
      address: location?.address || "Av. Principal 123, Ciudad",
      phone: location?.phone || "+1 234 567 890",
      email: location?.email || "reservas@Pepito'sHouse.com",
      mapCoordinates: location?.mapCoordinates || "",
      hours: parseHours()
    }
  });

  // Update settings mutation
  const settingsMutation = useMutation({
    mutationFn: async (params: { key: string, value: string }) => {
      const res = await apiRequest("PUT", `/api/settings/${params.key}`, { value: params.value });
      return await res.json();
    }
  });

  // Update all settings at once
  const updateAllSettings = async (values: BasicSettingsFormValues) => {
    try {
      await Promise.all([
        settingsMutation.mutateAsync({ key: "restaurantName", value: values.restaurantName }),
        settingsMutation.mutateAsync({ key: "restaurantLogo", value: values.restaurantLogo }),
        settingsMutation.mutateAsync({ key: "heroTitle", value: values.heroTitle }),
        settingsMutation.mutateAsync({ key: "heroSubtitle", value: values.heroSubtitle }),
        settingsMutation.mutateAsync({ key: "heroImage", value: values.heroImage }),
        settingsMutation.mutateAsync({ key: "reservationTitle", value: values.reservationTitle }),
        settingsMutation.mutateAsync({ key: "reservationDescription", value: values.reservationDescription }),
        settingsMutation.mutateAsync({ key: "reservationPhoneText", value: values.reservationPhoneText }),
        settingsMutation.mutateAsync({ key: "reservationConfirmationText", value: values.reservationConfirmationText }),
        settingsMutation.mutateAsync({ key: "isReservationsEnabled", value: String(values.isReservationsEnabled) })
      ]);
      
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      
      toast({
        title: "Configuración actualizada",
        description: "La información general ha sido actualizada correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración.",
        variant: "destructive",
      });
    }
  };

  // Update location mutation
  const locationMutation = useMutation({
    mutationFn: async (locationData: LocationFormValues) => {
      const res = await apiRequest("PUT", "/api/location", locationData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/location"] });
      toast({
        title: "Ubicación actualizada",
        description: "La información de ubicación ha sido actualizada correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar la ubicación: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleBasicSettingsSubmit = (values: BasicSettingsFormValues) => {
    updateAllSettings(values);
  };

  const handleLocationSubmit = (values: LocationFormValues) => {
    locationMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display font-bold mb-6">Configuración del Sitio</h2>
        <p className="text-muted-foreground mb-8">
          Personaliza la información y apariencia de tu sitio web.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="general" className="flex items-center">
            <Settings2 className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            Ubicación
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
              <CardDescription>
                Configura la información básica y apariencia de tu restaurante.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSettings ? (
                <div className="space-y-6">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : isSettingsError ? (
                <div className="text-center p-6 text-muted-foreground">
                  Error al cargar la configuración. Intenta de nuevo más tarde.
                </div>
              ) : (
                <Form {...basicSettingsForm}>
                  <form onSubmit={basicSettingsForm.handleSubmit(handleBasicSettingsSubmit)} className="space-y-6">
                    <Accordion type="single" collapsible defaultValue="section1" className="w-full">
                      <AccordionItem value="section1">
                        <AccordionTrigger className="text-lg font-medium">
                          <SquarePen className="h-5 w-5 mr-2" /> Identidad del Restaurante
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <FormField
                            control={basicSettingsForm.control}
                            name="restaurantName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre del Restaurante</FormLabel>
                                <FormControl>
                                  <Input placeholder="Pepito's House!" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={basicSettingsForm.control}
                            name="restaurantLogo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL del Logo</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://ejemplo.com/logo.jpg" {...field} />
                                </FormControl>
                                <FormDescription>
                                  URL de la imagen para el logo del restaurante.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {basicSettingsForm.watch("restaurantLogo") && (
                            <div className="p-4 border rounded-md bg-accent/20">
                              <p className="text-sm font-medium mb-2">Vista previa del logo:</p>
                              <div className="flex items-center gap-3">
                                <img 
                                  src={basicSettingsForm.watch("restaurantLogo")} 
                                  alt="Logo Preview" 
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                                <span className="font-display font-bold text-xl text-primary">
                                  {basicSettingsForm.watch("restaurantName")}
                                </span>
                              </div>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="section2">
                        <AccordionTrigger className="text-lg font-medium">
                          <Image className="h-5 w-5 mr-2" /> Sección Hero
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <FormField
                            control={basicSettingsForm.control}
                            name="heroTitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Título Principal</FormLabel>
                                <FormControl>
                                  <Input placeholder="Una experiencia culinaria inolvidable" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Título principal que aparece en la pantalla de inicio.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={basicSettingsForm.control}
                            name="heroSubtitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subtítulo</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Descubre nuestra propuesta gastronómica única..." 
                                    {...field} 
                                    className="resize-none"
                                    rows={3}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Texto descriptivo que aparece debajo del título principal.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={basicSettingsForm.control}
                            name="heroImage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Imagen de Fondo</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://ejemplo.com/imagen-principal.jpg" {...field} />
                                </FormControl>
                                <FormDescription>
                                  URL de la imagen que aparece como fondo en la sección principal.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {basicSettingsForm.watch("heroImage") && (
                            <div className="p-4 border rounded-md bg-accent/20">
                              <p className="text-sm font-medium mb-2">Vista previa de la imagen:</p>
                              <div className="aspect-video rounded-md overflow-hidden">
                                <img 
                                  src={basicSettingsForm.watch("heroImage")} 
                                  alt="Hero Preview" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="reservation">
                        <AccordionTrigger className="text-lg font-medium">
                          <CalendarCheck className="h-5 w-5 mr-2" /> Sección de Reservas
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <FormField
                            control={basicSettingsForm.control}
                            name="isReservationsEnabled"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Mostrar Sección de Reservas</FormLabel>
                                  <FormDescription>
                                    Activa o desactiva la sección de reservas en la página principal
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

                          <FormField
                            control={basicSettingsForm.control}
                            name="reservationTitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Título de la Sección</FormLabel>
                                <FormControl>
                                  <Input placeholder="¡Reserva tu Mesa en Pepito's House!" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Título principal de la sección de reservas.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={basicSettingsForm.control}
                            name="reservationDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Descripción</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Asegura tu lugar en nuestro restaurante..." 
                                    {...field} 
                                    className="resize-none"
                                    rows={3}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Texto descriptivo que aparece debajo del título.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={basicSettingsForm.control}
                            name="reservationPhoneText"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Texto del Teléfono</FormLabel>
                                <FormControl>
                                  <Input placeholder="¿Prefieres hacer tu reserva por teléfono? Llama al" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Texto que aparece antes del número de teléfono.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={basicSettingsForm.control}
                            name="reservationConfirmationText"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Texto de Confirmación</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Recuerda que todas las reservas requieren confirmación..." 
                                    {...field} 
                                    className="resize-none"
                                    rows={2}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Texto que aparece después del formulario de reservas.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="flex items-center"
                        disabled={settingsMutation.isPending}
                      >
                        {settingsMutation.isPending ? (
                          <>
                            <div className="spinner h-4 w-4 mr-2 animate-spin border-2 border-primary-foreground border-t-transparent rounded-full" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Cambios
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle>Información de Ubicación y Contacto</CardTitle>
              <CardDescription>
                Configura los datos de contacto y ubicación de tu restaurante.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLocation ? (
                <div className="space-y-6">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : isLocationError ? (
                <div className="text-center p-6 text-muted-foreground">
                  Error al cargar la información de ubicación. Intenta de nuevo más tarde.
                </div>
              ) : (
                <Form {...locationForm}>
                  <form onSubmit={locationForm.handleSubmit(handleLocationSubmit)} className="space-y-6">
                    <Accordion type="single" collapsible defaultValue="contact" className="w-full">
                      <AccordionItem value="contact">
                        <AccordionTrigger className="text-lg font-medium">
                          <Phone className="h-5 w-5 mr-2" /> Contacto
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <FormField
                            control={locationForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Teléfono</FormLabel>
                                <FormControl>
                                  <Input placeholder="+1 234 567 890" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Número de teléfono para reservas y contacto.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={locationForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Correo Electrónico</FormLabel>
                                <FormControl>
                                  <Input placeholder="reservas@Pepito'sHouse.com" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Dirección de correo electrónico para consultas.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="address">
                        <AccordionTrigger className="text-lg font-medium">
                          <MapPin className="h-5 w-5 mr-2" /> Dirección
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <FormField
                            control={locationForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Dirección Física</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Av. Principal 123, Ciudad" 
                                    {...field} 
                                    className="resize-none"
                                    rows={2}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={locationForm.control}
                            name="mapCoordinates"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Coordenadas del Mapa</FormLabel>
                                <FormControl>
                                  <Input placeholder="123.456" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Coordenadas para Google Maps (opcional).
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="hours">
                        <AccordionTrigger className="text-lg font-medium">
                          <Clock className="h-5 w-5 mr-2" /> Horario
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <FormField
                            control={locationForm.control}
                            name="hours"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Horario de Atención</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder={`{ "Lun - Jue": "12:00pm - 10:00pm", "Vie - Sáb": "12:00pm - 12:00am", "Domingo": "12:00pm - 9:00pm" }`} 
                                    {...field} 
                                    className="font-mono text-sm resize-none"
                                    rows={4}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Formato JSON de los horarios por día.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="p-4 border rounded-md bg-accent/20">
                            <p className="text-sm font-medium mb-2">Vista previa del horario:</p>
                            <ul className="space-y-1">
                              {(() => {
                                try {
                                  const hours = JSON.parse(locationForm.watch("hours") || "{}");
                                  return Object.entries(hours).map(([day, time]) => (
                                    <li key={day} className="flex items-start">
                                      <Clock className="h-4 w-4 mr-2 text-primary mt-1" />
                                      <span className="font-medium">{day}:</span>
                                      <span className="ml-1">{String(time)}</span>
                                    </li>
                                  ));
                                } catch (e) {
                                  return (
                                    <li className="text-destructive">
                                      Error en el formato JSON. Verifica la sintaxis.
                                    </li>
                                  );
                                }
                              })()}
                            </ul>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="delivery">
                        <AccordionTrigger className="text-lg font-medium">
                          <Truck className="h-5 w-5 mr-2" /> Configuración de WhatsApp
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <FormField
                            control={locationForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número de WhatsApp</FormLabel>
                                <FormControl>
                                  <Input placeholder="+1 234 567 890" {...field} />
                                </FormControl>
                                <FormDescription>
                                  El mismo número se usa para WhatsApp. Asegúrate de incluir el código de país.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="p-4 border rounded-md bg-accent/20">
                            <p className="text-sm font-medium mb-2">Información:</p>
                            <p className="text-sm text-muted-foreground">
                              Los pedidos se enviarán a este número de WhatsApp. Asegúrate de que esté activo y
                              configurado para recibir mensajes.
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="flex items-center"
                        disabled={locationMutation.isPending}
                      >
                        {locationMutation.isPending ? (
                          <>
                            <div className="spinner h-4 w-4 mr-2 animate-spin border-2 border-primary-foreground border-t-transparent rounded-full" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Cambios
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
