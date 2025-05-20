import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Validación del formulario con zod
const reservationSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  email: z.string().email({ message: "Ingrese un correo electrónico válido" }),
  phone: z.string().min(7, { message: "Ingrese un número de teléfono válido" }),
  date: z.date({
    required_error: "Por favor seleccione una fecha",
  }),
  time: z.string({
    required_error: "Por favor seleccione una hora",
  }),
  guests: z.coerce.number().min(1, { message: "Mínimo 1 comensal" }).max(20, { message: "Máximo 20 comensales" }),
  message: z.string().optional(),
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

// Opciones de horarios para reservas
const timeSlots = [
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", 
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"
];

const phoneRegex = /^(0?4[0-9]{9}|0?4[0-9]{2}-[0-9]{7})$/;

export default function ReservationForm() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      guests: 2,
      message: "",
    },
  });

  const onSubmit = async (data: ReservationFormValues) => {
    try {
      setSubmitting(true);
      
      // Formateamos la fecha en formato día/mes/año como pidió el usuario
      const formattedDate = format(data.date, "dd/MM/yyyy");
      
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          date: formattedDate, // Enviamos la fecha en formato dd/MM/yyyy
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ha ocurrido un error al procesar su reserva");
      }

      setSuccess(true);
      toast({
        title: "¡Reserva recibida!",
        description: "Nos comunicaremos contigo para confirmar tu reserva.",
      });

      // Reset form after 3 seconds
      setTimeout(() => {
        form.reset();
        setSuccess(false);
      }, 3000);

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al procesar su reserva",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-yellow-50 via-white to-red-50 rounded-3xl shadow-xl border-2 border-yellow-300">
      {success ? (
        <div className="text-center py-8">
          <CheckCircle className="w-20 h-20 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-3xl font-extrabold text-red-600 mb-2">¡Reserva Recibida!</h3>
          <p className="text-yellow-700 font-semibold">
            Gracias por reservar con nosotros. Te contactaremos pronto para confirmar tu reserva.
          </p>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre y apellido" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Tu número de WhatsApp (ej: 04169809812)" 
                        {...field}
                        onChange={(e) => {
                          // Eliminar todo excepto números y guiones
                          const value = e.target.value.replace(/[^\d-]/g, '');
                          // Limitar a 11 dígitos o formato con guión
                          const formattedValue = value.length > 11 ? value.slice(0, 11) : value;
                          field.onChange(formattedValue);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="guests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de comensales</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={20} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={"pl-3 text-left font-normal"}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Seleccione una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 3))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una hora" />
                          <Clock className="ml-auto h-4 w-4 opacity-50" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensaje adicional</FormLabel>
                  <FormControl>
                    <Textarea placeholder="¿Tienes alguna solicitud especial? Escríbela aquí..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-yellow-400 text-white font-bold text-lg py-3 rounded-full shadow-lg border-2 border-yellow-400 transition-all duration-200"
              disabled={submitting}
            >
              {submitting ? "Enviando..." : "Reservar mesa"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}