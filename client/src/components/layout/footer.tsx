import { Link } from "wouter";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Linkedin, Youtube, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Location, SocialMedia } from "@shared/schema";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube, FaTiktok, FaPinterest, FaGlobe } from "react-icons/fa";

type FooterProps = {
  logo: string;
  restaurantName: string;
};

export default function Footer({ logo, restaurantName }: FooterProps) {
  const { data: location } = useQuery<Location>({
    queryKey: ["/api/location"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  const { data: socialMedias = [] } = useQuery<SocialMedia[]>({
    queryKey: ["/api/social-media"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Filtrar solo redes sociales activas
  const activeSocialMedia = socialMedias.filter(social => social.isActive);
  
  // Obtener el icono correcto según el nombre de la red social
  const getSocialIcon = (iconName: string) => {
    switch(iconName.toLowerCase()) {
      case 'facebook':
        return <FaFacebook className="h-5 w-5" />;
      case 'instagram':
        return <FaInstagram className="h-5 w-5" />;
      case 'twitter':
        return <FaTwitter className="h-5 w-5" />;
      case 'linkedin':
        return <FaLinkedin className="h-5 w-5" />;
      case 'youtube':
        return <FaYoutube className="h-5 w-5" />;
      case 'tiktok':
        return <FaTiktok className="h-5 w-5" />;
      case 'pinterest':
        return <FaPinterest className="h-5 w-5" />;
      default:
        return <FaGlobe className="h-5 w-5" />;
    }
  };

  return (
    <footer className="bg-neutral-900 text-white pt-12 pb-8 border-t-4 border-yellow-400">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center mb-4">
              <img 
                src={logo} 
                alt={`${restaurantName} Logo`} 
                className="h-12 w-12 mr-3 rounded-full shadow-lg border-4 border-yellow-400 object-cover bg-white" 
              />
              <h3 className="text-2xl font-extrabold text-red-600 drop-shadow-lg">{restaurantName}</h3>
            </div>
            <p className="text-yellow-700 mb-4 font-semibold">
              Experiencia culinaria única que combina la tradición con la innovación.
            </p>
            <div className="flex space-x-4 mt-2">
              {activeSocialMedia.length > 0 ? (
                activeSocialMedia.map((social) => (
                  <a 
                    key={social.id} 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-yellow-500 transition-colors bg-white rounded-full p-2 shadow border-2 border-yellow-300 hover:border-red-500"
                    title={social.name}
                  >
                    {getSocialIcon(social.icon)}
                  </a>
                ))
              ) : (
                <>
                  <a href="#" className="text-red-600 hover:text-yellow-500 transition-colors bg-white rounded-full p-2 shadow border-2 border-yellow-300 hover:border-red-500">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-red-600 hover:text-yellow-500 transition-colors bg-white rounded-full p-2 shadow border-2 border-yellow-300 hover:border-red-500">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-red-600 hover:text-yellow-500 transition-colors bg-white rounded-full p-2 shadow border-2 border-yellow-300 hover:border-red-500">
                    <Twitter className="h-5 w-5" />
                  </a>
                </>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-lg font-extrabold text-red-600 mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <a href="#inicio" className="text-yellow-700 hover:text-red-600 font-semibold transition-colors">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#menu" className="text-yellow-700 hover:text-red-600 font-semibold transition-colors">
                  Menú
                </a>
              </li>
              <li>
                <a href="#ubicacion" className="text-yellow-700 hover:text-red-600 font-semibold transition-colors">
                  Ubicación
                </a>
              </li>
              <li>
                <a href="#nosotros" className="text-yellow-700 hover:text-red-600 font-semibold transition-colors">
                  Nosotros
                </a>
              </li>
              <li>
                <Link href="/admin-aut" className="text-yellow-700 hover:text-red-600 font-semibold transition-colors">
                  Administración
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-extrabold text-red-600 mb-4">Contacto</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-yellow-500 mt-1" />
                <span className="text-yellow-700 font-semibold">
                  {location?.address || "Av. Principal 123, Ciudad"}
                </span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 mr-3 text-yellow-500 mt-1" />
                <span className="text-yellow-700 font-semibold">
                  {location?.phone || "+1 234 567 890"}
                </span>
              </li>
              <li className="flex items-start">
                <Mail className="h-5 w-5 mr-3 text-yellow-500 mt-1" />
                <span className="text-yellow-700 font-semibold">
                  {location?.email || "reservas@Pepito'sHouse.com"}
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t-2 border-yellow-300 mt-10 pt-6 text-center text-yellow-700 font-semibold">
          <p>&copy; {new Date().getFullYear()} {restaurantName}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
