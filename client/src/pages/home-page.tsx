import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/home/hero-section";
import MenuOfDay from "@/components/home/menu-of-day";
import MenuSection from "@/components/home/menu-section";
import LocationSection from "@/components/home/location-section";
import TeamSection from "@/components/home/team-section";
import ReservationSection from "@/components/home/reservation-section";
import Cart from "@/components/cart";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Settings } from "@shared/schema";
import { Helmet } from "react-helmet";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { data: settings, isLoading } = useQuery<Settings[]>({
    queryKey: ["/api/settings"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const getSettingValue = (key: string) => {
    if (!settings) return "";
    const setting = settings.find(s => s.key === key);
    return setting ? setting.value : "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const restaurantName = getSettingValue("restaurantName") || "Pepito's House";
  const restaurantLogo = getSettingValue("restaurantLogo") || "https://images.unsplash.com/photo-1656137002630-6da73c6d5b11?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjB8fGZpcmUlMjBsb2dvfGVufDB8fDB8fHww";

  return (
    <>
      <Helmet>
        <title>{restaurantName} - Restaurante & Delivery</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
      </Helmet>
      
      <Header logo={restaurantLogo} restaurantName={restaurantName} />
      
      <main>
        <HeroSection />
        <MenuOfDay />
        <MenuSection />
        <ReservationSection />
        <LocationSection />
        <TeamSection />
      </main>
      
      <Footer logo={restaurantLogo} restaurantName={restaurantName} />
      
      <Cart />
    </>
  );
}
