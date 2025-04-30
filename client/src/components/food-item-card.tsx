import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { MenuItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { formatPrice, truncateText } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import FoodItemDialog from "./food-item-dialog";

type FoodItemCardProps = {
  item: MenuItem;
  featured?: boolean;
};

export default function FoodItemCard({ item, featured = false }: FoodItemCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const { addItem } = useCart();

  // Handle adding to cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(item);
  };

  // Handle "Order Now" click - open dialog
  const handleOrderNow = () => {
    setShowDialog(true);
  };

  return (
    <>
      <div 
        className={`bg-white rounded-xl shadow-lg overflow-hidden menu-item-card ${featured ? "card-hover-animation" : ""}`}
        onClick={handleOrderNow}
      >
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
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> 
              Añadir
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              onClick={handleOrderNow}
            >
              Ordenar
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
