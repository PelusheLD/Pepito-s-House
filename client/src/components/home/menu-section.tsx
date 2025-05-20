import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MenuItem, Category } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";
import FoodItemCard from "@/components/food-item-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function MenuSection() {
  const [activeCategory, setActiveCategory] = useState<string | null>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
  ) || [];

  // Paginación
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Resetear página al cambiar de categoría
  function handleCategoryChange(cat: string) {
    setActiveCategory(cat);
    setCurrentPage(1);
  }

  return (
    <section id="menu" className="py-16 bg-gradient-to-br from-yellow-50 via-white to-red-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-red-600 drop-shadow-lg mb-3">
            Nuestro Menú
          </h2>
          <p className="text-lg text-neutral-700 max-w-2xl mx-auto font-semibold">
            ¡Explora nuestra selección de platos irresistibles, preparados con el mejor sabor de Pepito's House!
          </p>
        </div>

        {/* Menu Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {isLoadingCategories ? (
            // Loading skeletons for categories
            Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-full" />
            ))
          ) : (
            <>
              <Button
                variant={activeCategory === "all" ? "default" : "outline"}
                className={
                  activeCategory === "all"
                    ? "bg-red-600 text-white font-bold border-2 border-yellow-400 shadow-md hover:bg-yellow-400 hover:text-red-700 transition-all"
                    : "bg-yellow-200 text-red-700 font-bold border-2 border-red-300 hover:bg-red-600 hover:text-white transition-all"
                }
                onClick={() => handleCategoryChange("all")}
              >
                Todos
              </Button>

              {categories?.map(category => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id.toString() ? "default" : "outline"}
                  className={
                    activeCategory === category.id.toString()
                      ? "bg-red-600 text-white font-bold border-2 border-yellow-400 shadow-md hover:bg-yellow-400 hover:text-red-700 transition-all"
                      : "bg-yellow-200 text-red-700 font-bold border-2 border-red-300 hover:bg-red-600 hover:text-white transition-all"
                  }
                  onClick={() => handleCategoryChange(category.id.toString())}
                >
                  {category.name}
                </Button>
              ))}
            </>
          )}
        </div>
        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {isLoadingItems ? (
            // Loading skeletons for menu items
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl shadow-xl border-2 border-yellow-200 overflow-hidden">
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
          ) : paginatedItems && paginatedItems.length > 0 ? (
            paginatedItems.map(item => (
              <FoodItemCard key={item.id} item={item} />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-red-500 text-xl font-bold">
                No hay platos disponibles en esta categoría.
              </p>
            </div>
          )}
        </div>
        {/* Controles de paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <Button
              variant="outline"
              className="font-bold px-3 py-1"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >Anterior</Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                className={
                  currentPage === i + 1
                    ? "bg-red-600 text-white border-yellow-400 font-bold"
                    : "bg-yellow-200 text-red-700 border-red-300 font-bold"
                }
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              className="font-bold px-3 py-1"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >Siguiente</Button>
          </div>
        )}
      </div>
    </section>
  );
}
