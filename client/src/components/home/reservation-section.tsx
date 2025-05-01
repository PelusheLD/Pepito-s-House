import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Settings } from "@shared/schema";
import ReservationForm from "./reservation-form";

export default function ReservationSection() {
  const { data: settings } = useQuery<Settings[]>({
    queryKey: ["/api/settings"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const getSettingValue = (key: string) => {
    if (!settings) return "";
    const setting = settings.find(s => s.key === key);
    return setting ? setting.value : "";
  };

  const isReservationsEnabled = getSettingValue("isReservationsEnabled") === "true";
  const title = getSettingValue("reservationTitle") || "¡Reserva tu Mesa en LLAMAS!";
  const description = getSettingValue("reservationDescription") || "Asegura tu lugar en nuestro restaurante completando el siguiente formulario. Nuestro equipo se comunicará contigo para confirmar tu reserva y atender cualquier solicitud especial.";
  const phoneText = getSettingValue("reservationPhoneText") || "¿Prefieres hacer tu reserva por teléfono? Llama al";
  const confirmationText = getSettingValue("reservationConfirmationText") || "Recuerda que todas las reservas requieren confirmación. Te contactaremos vía WhatsApp para verificar los detalles.";

  if (!isReservationsEnabled) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-primary mb-4">
            {title}
          </h2>
          <p className="text-gray-600 mb-8">
            {description}
          </p>
          
          <ReservationForm />
          
          <div className="mt-8 text-gray-600">
            <p className="mb-2">{phoneText}</p>
            <p>{confirmationText}</p>
          </div>
        </div>
      </div>
    </section>
  );
}