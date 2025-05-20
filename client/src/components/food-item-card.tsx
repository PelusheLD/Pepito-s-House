import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { MenuItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { formatPrice, truncateText } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import FoodItemDialog from "./food-item-dialog";
import { cn } from "@/lib/utils";

type FoodItemCardProps = {
  item: MenuItem;
  featured?: boolean;
};

export default function FoodItemCard({ item, featured = false }: FoodItemCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const { addItem } = useCart();
  const isAvailable = item.isAvailable === true;

  // Handle adding to cart - solo disponible si el ítem está disponible
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAvailable) {
      addItem(item);
    }
  };

  // Handle "Order Now" click - open dialog solo si está disponible
  const handleOrderNow = () => {
    if (isAvailable) {
      setShowDialog(true);
    }
  };

  return (
    <>
      <div 
        className={cn(
          `bg-white rounded-3xl shadow-xl overflow-hidden menu-item-card border-2`,
          featured ? "border-yellow-400 card-hover-animation" : "border-neutral-200",
          !isAvailable ? "opacity-60" : ""
        )}
        onClick={handleOrderNow}
      >
        <div className={featured ? "h-60 overflow-hidden" : "h-48 overflow-hidden"}>
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover rounded-t-3xl hover:scale-105 transition-transform duration-500 border-b-4 border-yellow-300" 
          />
        </div>
        <div className={featured ? "p-6 bg-gradient-to-br from-yellow-50 via-white to-red-50" : "p-5"}>
          <div className="flex justify-between items-start mb-2">
            <h3 className={`${featured ? "text-2xl text-red-700" : "text-lg"} font-display font-bold`}> 
              {item.name}
            </h3>
            <span className={`${featured ? "text-xl" : "text-base"} font-bold text-yellow-600 bg-red-100 px-3 py-1 rounded-full shadow-sm`}>
              {formatPrice(item.price)}
            </span>
          </div>
          <p className="text-neutral-700 text-base mb-4 font-medium">
            {truncateText(item.ingredients, featured ? 80 : 50)}
          </p>
          <div className="flex justify-between items-center mt-4">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-red-600 font-bold flex items-center p-0 hover:bg-yellow-100 hover:text-yellow-700 transition-colors"
              onClick={handleAddToCart}
              disabled={!isAvailable}
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> 
              Añadir
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className={cn(
                "bg-yellow-400 border-2 border-red-500 text-red-700 hover:bg-red-600 hover:text-white font-bold rounded-full px-6 py-2 transition-all duration-200",
                !isAvailable && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleOrderNow}
              disabled={!isAvailable}
            >
              {isAvailable ? "Ordenar" : "No disponible"}
            </Button>
          </div>
        </div>
      </div>

      <FoodItemDialog 
        item={item} 
        open={showDialog} 
        onOpenChange={setShowDialog} 
      />
    </>
  );
}
