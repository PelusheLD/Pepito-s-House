import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Phone, RefreshCw, Trash, UserRound, Send } from "lucide-react";

type Reservation = {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  message: string | null;
  status: string;
  createdAt: string;
};

// Función para obtener URL de WhatsApp para mensajes
function getWhatsAppUrl(phone: string, message: string): string {
  // Asegurarse de que el número tenga el formato correcto
  let formattedPhone = phone.replace(/\D/g, ''); // Eliminar todo excepto números
  
  // Si no empieza con código de país, asumir que es de Venezuela (+58)
  if (!formattedPhone.startsWith('58')) {
    formattedPhone = '58' + formattedPhone;
  }
  
  // Codificar el mensaje para URL
  const encodedMessage = encodeURIComponent(message);
  
  // Construir la URL de WhatsApp
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

// Función para generar mensajes de confirmación de reserva
function generateConfirmationMessage(reservation: Reservation): string {
  return `Hola ${reservation.name}, ¡tu reserva en LLAMAS ha sido confirmada! Te esperamos el ${format(parseISO(reservation.date), "d 'de' MMMM", { locale: es })} a las ${reservation.time} para ${reservation.guests} ${reservation.guests > 1 ? "personas" : "persona"}. Cualquier cambio, por favor avísanos con anticipación. ¡Gracias!`;
}

// Función para generar mensajes de cambio de estado de reserva
function generateStatusChangeMessage(reservation: Reservation, newStatus: string): string {
  const statusMessages = {
    confirmed: `Hola ${reservation.name}, ¡tu reserva en LLAMAS ha sido confirmada! Te esperamos el ${format(parseISO(reservation.date), "d 'de' MMMM", { locale: es })} a las ${reservation.time}.`,
    "in-progress": `Hola ${reservation.name}, ¡esperamos estés disfrutando tu experiencia en LLAMAS! Si necesitas algo adicional, no dudes en pedirlo a nuestro personal.`,
    completed: `Hola ${reservation.name}, ¡gracias por visitarnos en LLAMAS! Esperamos que hayas disfrutado tu experiencia. Nos encantaría recibir tus comentarios y verte nuevamente pronto.`,
    cancelled: `Hola ${reservation.name}, lamentamos informarte que tu reserva en LLAMAS para el ${format(parseISO(reservation.date), "d 'de' MMMM", { locale: es })} a las ${reservation.time} ha sido cancelada. Para más información o para reprogramar, por favor contáctanos.`
  };
  
  return statusMessages[newStatus as keyof typeof statusMessages] || "";
}

function getStatusBadge(status: string) {
  const statusColors: Record<string, { color: string, label: string }> = {
    pending: { color: "bg-yellow-100 text-yellow-800", label: "Pendiente" },
    confirmed: { color: "bg-blue-100 text-blue-800", label: "Confirmada" },
    "in-progress": { color: "bg-purple-100 text-purple-800", label: "En Progreso" },
    completed: { color: "bg-green-100 text-green-800", label: "Completada" },
    cancelled: { color: "bg-red-100 text-red-800", label: "Cancelada" }
  };

  const { color, label } = statusColors[status] || statusColors.pending;

  return (
    <Badge className={color}>
      {label}
    </Badge>
  );
}

export default function ReservationManagement() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { toast } = useToast();

  // Obtener todas las reservas
  const { data: reservations, isLoading, refetch } = useQuery<Reservation[]>({
    queryKey: ["/api/reservations"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Filtrar reservas según la pestaña seleccionada
  const filteredReservations = reservations?.filter(reservation => {
    if (selectedTab === "all") return true;
    return reservation.status === selectedTab;
  }) || [];

  // Mutación para actualizar el estado de una reserva
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/reservations/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      toast({
        title: "Estado actualizado",
        description: "El estado de la reserva ha sido actualizado correctamente."
      });
      setIsStatusDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el estado: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Mutación para eliminar una reserva
  const deleteReservationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/reservations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      toast({
        title: "Reserva eliminada",
        description: "La reserva ha sido eliminada correctamente."
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar la reserva: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleChangeStatus = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setNewStatus(reservation.status);
    setIsStatusDialogOpen(true);
  };

  const handleDeleteReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDeleteDialogOpen(true);
  };

  const confirmStatusChange = () => {
    if (selectedReservation && newStatus) {
      updateStatusMutation.mutate({ id: selectedReservation.id, status: newStatus });
    }
  };

  const confirmDelete = () => {
    if (selectedReservation) {
      deleteReservationMutation.mutate(selectedReservation.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center justify-between">
          <span>Gestión de Reservas</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Actualizar
          </Button>
        </CardTitle>
        <CardDescription>
          Administra las reservas de mesas en el restaurante
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="all"
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmadas</TabsTrigger>
            <TabsTrigger value="in-progress">En Progreso</TabsTrigger>
            <TabsTrigger value="completed">Completadas</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-0">
            {isLoading ? (
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredReservations.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Fecha y Hora</TableHead>
                      <TableHead>Personas</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <UserRound className="h-4 w-4 text-neutral-500" />
                            <span>{reservation.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-neutral-500" />
                              <a 
                                href={`tel:${reservation.phone}`}
                                className="text-blue-600 hover:underline"
                              >
                                {reservation.phone}
                              </a>
                            </div>
                            <div>{reservation.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-neutral-500" />
                              <span>
                                {format(parseISO(reservation.date), "d 'de' MMMM, yyyy", { locale: es })}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-neutral-500" />
                              <span>{reservation.time}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{reservation.guests}</TableCell>
                        <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleChangeStatus(reservation)}
                            >
                              Cambiar Estado
                            </Button>
                            <a 
                              href={getWhatsAppUrl(reservation.phone, generateConfirmationMessage(reservation))}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="secondary" size="sm">
                                <Send className="h-4 w-4 mr-1" /> WhatsApp
                              </Button>
                            </a>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteReservation(reservation)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10 text-neutral-500">
                No hay reservas {selectedTab !== "all" ? "con este estado" : ""} disponibles.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Diálogo para cambiar estado */}
      <Dialog open={isStatusDialogOpen} onOpenChange={(open) => setIsStatusDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Estado de Reserva</DialogTitle>
            <DialogDescription>
              Actualiza el estado de la reserva de {selectedReservation?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="status">Nuevo Estado</label>
              <Select
                value={newStatus}
                onValueChange={setNewStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="in-progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedReservation && newStatus && newStatus !== selectedReservation.status && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">Mensaje para WhatsApp:</p>
                <div className="bg-gray-100 p-3 rounded-md text-sm">
                  {generateStatusChangeMessage(selectedReservation, newStatus)}
                </div>
                <div className="mt-3 flex justify-end">
                  <a
                    href={getWhatsAppUrl(selectedReservation.phone, generateStatusChangeMessage(selectedReservation, newStatus))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center"
                  >
                    <Send className="h-3 w-3 mr-1" /> Enviar por WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>Cancelar</Button>
            <Button 
              onClick={confirmStatusChange}
              disabled={updateStatusMutation.isPending || !newStatus || (selectedReservation?.status === newStatus)}
            >
              {updateStatusMutation.isPending ? "Actualizando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => setIsDeleteDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la reserva de {selectedReservation?.name}?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteReservationMutation.isPending}
            >
              {deleteReservationMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}