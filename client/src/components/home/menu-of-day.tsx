import { useQuery } from "@tanstack/react-query";
import { MenuItem } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";
import FoodItemCard from "@/components/food-item-card";
import { Skeleton } from "@/components/ui/skeleton";
import { GiHotDog, GiFullPizza } from "react-icons/gi";

export default function MenuOfDay() {
  const { data: featuredItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items/featured"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Filtrar solo los platillos destacados que estén disponibles
  const availableFeaturedItems = featuredItems?.filter(item => item.isAvailable);

  return (
    <section id="menu-del-dia" className="py-16 bg-gradient-to-br from-yellow-100 via-yellow-50 to-red-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-2">
            <span className="text-3xl text-red-500"><GiHotDog /></span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-red-600 drop-shadow-lg">
              Menú del Día
            </h2>
            <span className="text-3xl text-yellow-500"><GiFullPizza /></span>
          </div>
          <p className="text-lg text-neutral-700 max-w-2xl mx-auto font-semibold">
            ¡Disfruta nuestra selección especial de hoy, con el mejor sabor de Pepito's House!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            // Loading skeletons
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl shadow-2xl border-2 border-yellow-300 overflow-hidden">
                <Skeleton className="h-60 w-full" />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </div>
            ))
          ) : availableFeaturedItems && availableFeaturedItems.length > 0 ? (
            availableFeaturedItems.map((item) => (
              <FoodItemCard key={item.id} item={item} featured />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-red-500 text-xl font-bold">
                No hay platos destacados disponibles actualmente.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
