import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { MenuItem } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { Plus, Minus, ShoppingCart, X } from "lucide-react";

type FoodItemDialogProps = {
  item: MenuItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function FoodItemDialog({ 
  item, 
  open, 
  onOpenChange 
}: FoodItemDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setQuantity(value);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    addItem(item, quantity);
    onOpenChange(false);
    setQuantity(1); // Reset quantity after adding
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
        <button 
          className="absolute top-4 right-4 bg-neutral-800/50 hover:bg-neutral-800 text-white p-2 rounded-full z-10"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="h-64 overflow-hidden">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover" 
          />
        </div>
        
        <div className="p-6">
          <DialogHeader>
            <div className="flex justify-between items-start mb-3">
              <DialogTitle className="text-2xl font-display font-semibold">
                {item.name}
              </DialogTitle>
              <span className="text-xl font-semibold text-primary">
                {formatPrice(item.price)}
              </span>
            </div>
          </DialogHeader>
          
          <p className="text-neutral-600 mb-4">{item.description}</p>
          <p className="text-sm text-neutral-500 mb-6">
            <span className="font-medium">Ingredientes:</span> {item.ingredients}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-10 w-10" 
                onClick={decreaseQuantity}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-12 text-center border-x border-neutral-300 h-10 rounded-none"
              />
              <Button 
                variant="ghost" 
                size="icon"
                className="h-10 w-10" 
                onClick={increaseQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> 
              Añadir al carrito
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
