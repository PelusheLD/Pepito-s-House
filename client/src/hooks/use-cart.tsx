import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { MenuItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

interface Location {
  phone: string;
  address: string;
  email: string;
  // ... otros campos que pueda tener location
}

export type CartItem = {
  id: number;
  menuItem: MenuItem;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (menuItem: MenuItem, quantity?: number) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  totalPrice: number;
  checkout: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: location } = useQuery<Location>({
    queryKey: ["/api/location"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (menuItem: MenuItem, quantity = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.menuItem.id === menuItem.id);
      
      if (existingItem) {
        return prevItems.map((item) => 
          item.menuItem.id === menuItem.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      
      return [...prevItems, { id: Date.now(), menuItem, quantity }];
    });
    
    toast({
      title: "Añadido al carrito",
      description: `${menuItem.name} ha sido añadido al carrito.`,
    });
    
    // Open cart after adding item
    setIsOpen(true);
  };

  const removeItem = (id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    
    setItems((prevItems) => 
      prevItems.map((item) => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => {
    setIsOpen(true);
  };

  const closeCart = () => {
    setIsOpen(false);
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  const totalPrice = items.reduce(
    (total, item) => total + item.menuItem.price * item.quantity, 
    0
  );

  const checkout = () => {
    if (!location?.phone) {
      toast({
        title: "Error",
        description: "No se ha configurado un número de WhatsApp para realizar pedidos",
        variant: "destructive",
      });
      return;
    }

    // Format WhatsApp message
    let message = 'Hola, quiero hacer un pedido:%0A%0A';
    
    items.forEach(item => {
      message += `${item.quantity}x ${item.menuItem.name} - $${(item.menuItem.price * item.quantity).toFixed(2)}%0A`;
    });
    
    message += `%0ATotal: $${totalPrice.toFixed(2)}`;
    
    // Format phone number for WhatsApp
    const formattedPhone = location.phone.replace(/\D/g, '');
    
    // Open WhatsApp with formatted message
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
    
    // Optionally clear cart after checkout
    // clearCart();
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        openCart,
        closeCart,
        totalItems,
        totalPrice,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
