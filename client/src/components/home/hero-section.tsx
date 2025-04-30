import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Settings } from "@shared/schema";

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

  const heroTitle = getSettingValue("heroTitle") || "Una experiencia culinaria inolvidable";
  const heroSubtitle = getSettingValue("heroSubtitle") || "Descubre nuestra propuesta gastronómica única, elaborada con los mejores ingredientes frescos y locales.";
  const heroImage = getSettingValue("heroImage") || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80";

  return (
    <section id="inicio" className="relative h-[80vh] bg-neutral-900 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Restaurant Interior" 
          className="w-full h-full object-cover opacity-70" 
        />
        <div className="hero-overlay"></div>
      </div>
      <div className="container mx-auto px-4 h-full flex items-center relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 leading-tight">
            {heroTitle}
          </h1>
          <p className="text-xl text-neutral-100 mb-8">
            {heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              asChild 
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 h-auto"
            >
              <a href="#menu">Ver Menú</a>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-3 h-auto"
            >
              <a href="#menu-del-dia">Menú del Día</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
