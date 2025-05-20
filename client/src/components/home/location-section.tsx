import { useQuery } from "@tanstack/react-query";
import { Location } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export default function LocationSection() {
  const { data: location, isLoading } = useQuery<Location>({
    queryKey: ["/api/location"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Parse hours from JSON string if available
  const parseHours = () => {
    if (!location?.hours) return null;
    
    try {
      return JSON.parse(location.hours);
    } catch (e) {
      return { 
        "Lun - Jue": "12:00pm - 10:00pm",
        "Vie - Sáb": "12:00pm - 12:00am", 
        "Domingo": "12:00pm - 9:00pm"
      };
    }
  };

  const hours = parseHours();

  return (
    <section id="ubicacion" className="py-16 bg-gradient-to-br from-yellow-50 via-white to-red-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-red-600 drop-shadow-lg mb-3">
            Nuestra Ubicación
          </h2>
          <p className="text-lg text-neutral-700 max-w-2xl mx-auto font-semibold">
            ¡Encuéntranos en el corazón de la ciudad o pide a domicilio y disfruta el sabor de Pepito's House!
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {isLoading ? (
            // Loading skeleton for location info
            <Card className="p-6 border-2 border-yellow-300 rounded-3xl shadow-xl">
              <div className="mb-4">
                <Skeleton className="h-7 w-32 mb-2" />
                <Skeleton className="h-5 w-64" />
              </div>
              <div className="mb-4">
                <Skeleton className="h-7 w-32 mb-2" />
                <Skeleton className="h-5 w-48 mb-1" />
                <Skeleton className="h-5 w-52 mb-1" />
                <Skeleton className="h-5 w-44" />
              </div>
              <div>
                <Skeleton className="h-7 w-32 mb-2" />
                <Skeleton className="h-5 w-48 mb-1" />
                <Skeleton className="h-5 w-56" />
              </div>
            </Card>
          ) : (
            <Card className="bg-white p-8 rounded-3xl shadow-xl border-2 border-yellow-400">
              <div className="mb-6">
                <h3 className="text-2xl font-display font-bold mb-2 text-red-600 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-yellow-500" /> Dirección
                </h3>
                <p className="text-neutral-700 flex items-center text-lg font-semibold">
                  {location?.address || "Av. Principal 123, Ciudad"}
                </p>
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-display font-bold mb-2 text-red-600 flex items-center gap-2">
                  <Clock className="h-6 w-6 text-yellow-500" /> Horario
                </h3>
                <ul className="text-neutral-700 space-y-1 text-lg">
                  {hours ? (
                    Object.entries(hours).map(([day, time]) => (
                      <li key={day} className="flex items-start">
                        <span className="font-bold text-yellow-600 mr-2">{day}:</span>
                        <span className="ml-1">{time as string}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start">
                        <span className="font-bold text-yellow-600 mr-2">Lun - Jue:</span>
                        <span className="ml-1">12:00pm - 10:00pm</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold text-yellow-600 mr-2">Vie - Sáb:</span>
                        <span className="ml-1">12:00pm - 12:00am</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold text-yellow-600 mr-2">Domingo:</span>
                        <span className="ml-1">12:00pm - 9:00pm</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold mb-2 text-red-600 flex items-center gap-2">
                  <Phone className="h-6 w-6 text-yellow-500" /> Contacto
                </h3>
                <p className="text-neutral-700 mb-1 flex items-center text-lg font-semibold">
                  <Phone className="h-5 w-5 text-red-400 mr-2" />
                  {location?.phone || "+1 234 567 890"}
                </p>
                <p className="text-neutral-700 flex items-center text-lg font-semibold">
                  <Mail className="h-5 w-5 text-red-400 mr-2" />
                  {location?.email || "reservas@Pepito'sHouse.com"}
                </p>
              </div>
            </Card>
          )}
          <div className="h-96 bg-neutral-200 rounded-3xl overflow-hidden shadow-xl border-2 border-yellow-400">
            {(location?.mapCoordinates ? (
              <iframe
                src={`https://maps.google.com/maps?q=${location.mapCoordinates}&z=18&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                <div className="text-center px-4">
                  <MapPin className="h-12 w-12 text-yellow-500 mb-4 mx-auto" />
                  <p className="text-neutral-700 font-bold text-xl">Mapa interactivo</p>
                  <p className="text-neutral-600 text-base mt-2">
                    Encuéntranos en el centro de la ciudad.
                  </p>
                </div>
              </div>
            )) as React.ReactNode}
          </div>
        </div>
      </div>
    </section>
  );
}
