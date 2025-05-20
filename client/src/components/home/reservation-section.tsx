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
  const title = getSettingValue("reservationTitle") || "¡Reserva tu Mesa en Pepito's House!";
  const description = getSettingValue("reservationDescription") || "Asegura tu lugar en nuestro restaurante completando el siguiente formulario. Nuestro equipo se comunicará contigo para confirmar tu reserva y atender cualquier solicitud especial.";
  const phoneText = getSettingValue("reservationPhoneText") || "¿Prefieres hacer tu reserva por teléfono? Llama al";
  const confirmationText = getSettingValue("reservationConfirmationText") || "Recuerda que todas las reservas requieren confirmación. Te contactaremos vía WhatsApp para verificar los detalles.";

  if (!isReservationsEnabled) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-yellow-50 via-white to-red-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center bg-white/90 rounded-3xl shadow-xl border-2 border-yellow-400 p-10">
          <h2 className="text-4xl font-extrabold text-red-600 drop-shadow-lg mb-4">
            {title}
          </h2>
          <p className="text-lg text-neutral-700 mb-8 font-semibold">
            {description}
          </p>
          <ReservationForm />
          <div className="mt-8 text-yellow-700 bg-yellow-100 rounded-xl p-4 border border-yellow-300">
            <p className="mb-2 font-bold text-lg">{phoneText}</p>
            <p className="text-red-600 font-semibold">{confirmationText}</p>
          </div>
        </div>
      </div>
    </section>
  );
}