import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  ShoppingBag
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";

export default function Cart() {
  const { 
    items, 
    isOpen, 
    closeCart, 
    openCart, 
    removeItem, 
    updateQuantity, 
    totalItems, 
    totalPrice,
    checkout
  } = useCart();

  // For mobile devices, listen to window scroll to hide/show the cart button
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Mobile fixed cart button */}
      <div 
        className={`fixed bottom-4 right-4 z-30 sm:hidden transition-transform duration-300 ${
          isScrolled ? "translate-y-0" : "translate-y-20"
        }`}
      >
        <Button 
          onClick={openCart} 
          className="h-14 w-14 rounded-full bg-primary text-white shadow-lg"
        >
          <ShoppingCart className="h-6 w-6" />
          <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {totalItems}
          </span>
        </Button>
      </div>

      {/* Cart Sheet (Drawer) */}
      <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
        <SheetContent className="flex flex-col p-0 w-full sm:max-w-md">
          <SheetHeader className="px-4 py-3 bg-primary text-white sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <SheetTitle className="text-white flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Tu Carrito
              </SheetTitle>
              <SheetClose className="rounded-full p-1 hover:bg-primary-foreground/20">
                <X className="h-5 w-5" />
              </SheetClose>
            </div>
          </SheetHeader>
          
          <div className="flex-grow overflow-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium">Tu carrito está vacío</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Agrega algunos platos deliciosos para comenzar tu pedido.
                </p>
              </div>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li 
                    key={item.id} 
                    className="flex items-start border-b border-border pb-4"
                  >
                    <div className="h-16 w-16 rounded overflow-hidden mr-3 flex-shrink-0">
                      <img 
                        src={item.menuItem.image} 
                        alt={item.menuItem.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-grow">
                      <h4 className="font-medium">{item.menuItem.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {formatPrice(item.menuItem.price)}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border rounded">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="px-2 h-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="px-2 h-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 h-8 px-2" 
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="font-medium ml-2">
                      {formatPrice(item.menuItem.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <SheetFooter className="px-4 py-3 border-t bg-card">
            <div className="w-full">
              <div className="flex justify-between text-lg font-semibold mb-4">
                <span>Total:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <Button 
                onClick={checkout}
                className="w-full bg-primary hover:bg-primary/90" 
                disabled={items.length === 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Realizar Pedido por WhatsApp
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
