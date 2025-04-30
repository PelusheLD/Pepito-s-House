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
    <section id="ubicacion" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-800 mb-3">
            Nuestra Ubicación
          </h2>
          <p className="text-lg text-neutral-800/80 max-w-2xl mx-auto">
            Encuéntranos en el corazón de la ciudad. Ven a visitarnos o pide a domicilio.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {isLoading ? (
            // Loading skeleton for location info
            <Card className="p-6">
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
            <Card className="bg-white p-6 rounded-xl shadow-lg">
              <div className="mb-4">
                <h3 className="text-xl font-display font-bold mb-2">Dirección</h3>
                <p className="text-neutral-700 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  {location?.address || "Av. Principal 123, Ciudad"}
                </p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-xl font-display font-bold mb-2">Horario</h3>
                <ul className="text-neutral-700 space-y-1">
                  {hours ? (
                    Object.entries(hours).map(([day, time]) => (
                      <li key={day} className="flex items-start">
                        <Clock className="h-4 w-4 mr-2 text-primary mt-1" />
                        <span className="font-medium">{day}:</span>
                        <span className="ml-1">{time}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start">
                        <Clock className="h-4 w-4 mr-2 text-primary mt-1" />
                        <span className="font-medium">Lun - Jue:</span>
                        <span className="ml-1">12:00pm - 10:00pm</span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-4 w-4 mr-2 text-primary mt-1" />
                        <span className="font-medium">Vie - Sáb:</span>
                        <span className="ml-1">12:00pm - 12:00am</span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-4 w-4 mr-2 text-primary mt-1" />
                        <span className="font-medium">Domingo:</span>
                        <span className="ml-1">12:00pm - 9:00pm</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-display font-bold mb-2">Contacto</h3>
                <p className="text-neutral-700 mb-1 flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-primary" />
                  {location?.phone || "+1 234 567 890"}
                </p>
                <p className="text-neutral-700 flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-primary" />
                  {location?.email || "reservas@llamas.com"}
                </p>
              </div>
            </Card>
          )}
          
          <div className="h-96 bg-neutral-200 rounded-xl overflow-hidden shadow-lg">
            {location?.mapCoordinates ? (
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d${location.mapCoordinates}!2d-74.0060!3d40.7128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM40zMCcwOC41Ik4gNzTCsDAyJzI0LjAiVw!5e0!3m2!1sen!2sus!4v1625103650!5m2!1sen!2sus`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                <div className="text-center px-4">
                  <MapPin className="h-12 w-12 text-primary mb-4 mx-auto" />
                  <p className="text-neutral-700 font-medium">Mapa interactivo</p>
                  <p className="text-neutral-600 text-sm mt-2">
                    Encuéntranos en el centro de la ciudad.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
