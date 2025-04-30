import { Link } from "wouter";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Location } from "@shared/schema";

type FooterProps = {
  logo: string;
  restaurantName: string;
};

export default function Footer({ logo, restaurantName }: FooterProps) {
  const { data: location } = useQuery<Location>({
    queryKey: ["/api/location"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img 
                src={logo} 
                alt={`${restaurantName} Logo`} 
                className="h-10 w-auto mr-3 rounded-full shadow object-cover" 
              />
              <h3 className="text-xl font-display font-bold text-white">{restaurantName}</h3>
            </div>
            <p className="text-neutral-400 mb-4">
              Experiencia culinaria única que combina la tradición con la innovación.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-display font-bold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <a href="#inicio" className="text-neutral-400 hover:text-white transition-colors">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#menu" className="text-neutral-400 hover:text-white transition-colors">
                  Menú
                </a>
              </li>
              <li>
                <a href="#ubicacion" className="text-neutral-400 hover:text-white transition-colors">
                  Ubicación
                </a>
              </li>
              <li>
                <a href="#nosotros" className="text-neutral-400 hover:text-white transition-colors">
                  Nosotros
                </a>
              </li>
              <li>
                <Link href="/admin-aut" className="text-neutral-400 hover:text-white transition-colors">
                  Administración
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-display font-bold mb-4">Contacto</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-primary mt-1" />
                <span className="text-neutral-400">
                  {location?.address || "Av. Principal 123, Ciudad"}
                </span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 mr-3 text-primary mt-1" />
                <span className="text-neutral-400">
                  {location?.phone || "+1 234 567 890"}
                </span>
              </li>
              <li className="flex items-start">
                <Mail className="h-5 w-5 mr-3 text-primary mt-1" />
                <span className="text-neutral-400">
                  {location?.email || "reservas@llamas.com"}
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-500">
          <p>&copy; {new Date().getFullYear()} {restaurantName}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
