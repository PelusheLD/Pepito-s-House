import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { MenuItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { formatPrice, truncateText } from "@/lib/utils";
import { ShoppingCart, CircleDot } from "lucide-react";
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
          `bg-white rounded-xl shadow-lg overflow-hidden menu-item-card`,
          featured ? "card-hover-animation" : "",
          !isAvailable ? "opacity-60" : ""
        )}
        onClick={handleOrderNow}
      >
        {/* Indicador de disponibilidad */}
        <div className="absolute top-2 right-2 z-10">
          <CircleDot className={cn(
            "h-5 w-5",
            isAvailable ? "text-green-500" : "text-red-500"
          )} />
        </div>
        
        <div className={featured ? "h-60 overflow-hidden" : "h-48 overflow-hidden"}>
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
          />
        </div>
        <div className={featured ? "p-6" : "p-5"}>
          <div className="flex justify-between items-start mb-2">
            <h3 className={`${featured ? "text-xl" : "text-lg"} font-display font-semibold`}>
              {item.name}
            </h3>
            <span className={`${featured ? "text-lg" : "text-base"} font-semibold text-primary`}>
              {formatPrice(item.price)}
            </span>
          </div>
          <p className="text-neutral-600 text-sm mb-4">
            {truncateText(item.ingredients, featured ? 80 : 50)}
          </p>
          
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-primary font-medium flex items-center p-0"
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
                "bg-primary/10 text-primary hover:bg-primary/20 transition-colors",
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
