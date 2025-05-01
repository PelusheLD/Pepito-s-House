import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MenuItem, Category } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";
import FoodItemCard from "@/components/food-item-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function MenuSection() {
  const [activeCategory, setActiveCategory] = useState<string | null>("all");

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Fetch menu items
  const { data: menuItems, isLoading: isLoadingItems } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Filtrar solo los platillos disponibles
  const availableMenuItems = menuItems?.filter(item => item.isAvailable);

  // Filter items based on active category
  const filteredItems = availableMenuItems?.filter(item => 
    activeCategory === "all" || item.categoryId?.toString() === activeCategory
  );

  return (
    <section id="menu" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-800 mb-3">
            Nuestro Menú
          </h2>
          <p className="text-lg text-neutral-800/80 max-w-2xl mx-auto">
            Explora nuestra selección de platos preparados con los ingredientes más frescos y las técnicas más refinadas.
          </p>
        </div>

        {/* Menu Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {isLoadingCategories ? (
            // Loading skeletons for categories
            Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-full" />
            ))
          ) : (
            <>
              <Button 
                variant={activeCategory === "all" ? "default" : "outline"}
                className={activeCategory === "all" ? "bg-primary text-white" : "bg-neutral-200 text-neutral-800"}
                onClick={() => setActiveCategory("all")}
              >
                Todos
              </Button>
              
              {categories?.map(category => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id.toString() ? "default" : "outline"}
                  className={activeCategory === category.id.toString() 
                    ? "bg-primary text-white" 
                    : "bg-neutral-200 text-neutral-800"
                  }
                  onClick={() => setActiveCategory(category.id.toString())}
                >
                  {category.name}
                </Button>
              ))}
            </>
          )}
        </div>
        
        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoadingItems ? (
            // Loading skeletons for menu items
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full mb-3" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredItems && filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <FoodItemCard key={item.id} item={item} />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground text-lg">
                No hay platos disponibles en esta categoría.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
