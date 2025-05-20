import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Settings } from "@shared/schema";
import { GiHamburger, GiFrenchFries } from "react-icons/gi";

export default function HeroSection() {
  const { data: settings } = useQuery<Settings[]>({
    queryKey: ["/api/settings"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const getSettingValue = (key: string) => {
    if (!settings) return "";
    const setting = settings.find(s => s.key === key);
    return setting ? setting.value : "";
  };

  const heroTitle = getSettingValue("heroTitle") || "¡Bienvenido a Pepito's House!";
  const heroSubtitle = getSettingValue("heroSubtitle") || "La mejor comida rápida, servida con pasión y sabor. ¡Disfruta hamburguesas, papas y mucho más!";
  const heroImage = getSettingValue("heroImage") || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80";

  return (
    <section
      id="inicio"
      className="relative h-[90vh] bg-gradient-to-br from-yellow-400 via-red-500 to-yellow-500 overflow-hidden flex items-center justify-center"
    >
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Pepito's House"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-60"></div>
      </div>
      <div className="container mx-auto px-4 h-full flex items-center relative z-10">
        <div className="max-w-2xl bg-white/90 rounded-3xl shadow-2xl p-10 border-4 border-yellow-400">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl"><GiHamburger /></span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-red-600 drop-shadow-lg leading-tight">
              {heroTitle}
            </h1>
            <span className="text-4xl"><GiFrenchFries /></span>
          </div>
          <p className="text-xl text-gray-800 mb-8 font-semibold">
            {heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              className="bg-red-600 hover:bg-yellow-400 text-white font-bold px-8 py-3 h-auto text-lg shadow-lg border-2 border-yellow-400 rounded-full transition-all duration-200"
            >
              <a href="#menu">Ver Menú</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="bg-yellow-400 border-2 border-red-600 text-red-700 hover:bg-red-600 hover:text-white px-8 py-3 h-auto text-lg font-bold rounded-full shadow-lg transition-all duration-200"
            >
              <a href="#menu-del-dia">Menú del Día</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
