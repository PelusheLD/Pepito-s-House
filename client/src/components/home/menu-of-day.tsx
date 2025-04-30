import { useQuery } from "@tanstack/react-query";
import { MenuItem } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";
import FoodItemCard from "@/components/food-item-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MenuOfDay() {
  const { data: featuredItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items/featured"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  return (
    <section id="menu-del-dia" className="py-16 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-800 mb-3">
            Menú del Día
          </h2>
          <p className="text-lg text-neutral-800/80 max-w-2xl mx-auto">
            Nuestra selección especial de hoy, elaborada con ingredientes frescos de temporada.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden">
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
          ) : featuredItems && featuredItems.length > 0 ? (
            featuredItems.map((item) => (
              <FoodItemCard key={item.id} item={item} featured />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground text-lg">
                No hay platos destacados disponibles actualmente.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
