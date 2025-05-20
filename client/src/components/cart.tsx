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
import { useQuery } from "@tanstack/react-query";
import { Location } from "@shared/schema";
import { Switch } from "@/components/ui/switch";

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

  // Estado para el flujo de delivery
  const [showDeliveryStep, setShowDeliveryStep] = useState(false);
  const [wantsDelivery, setWantsDelivery] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState("");

  // Obtener número de WhatsApp desde location
  const { data: location } = useQuery<Location>({
    queryKey: ["/api/location"],
    queryFn: async () => {
      const res = await fetch("/api/location");
      return res.json();
    },
  });
  const getWhatsAppPhone = () => {
    let phone = location?.phone || "";
    phone = phone.replace(/\D/g, "");
    if (phone && !phone.startsWith("58")) {
      phone = "58" + phone;
    }
    return phone || "582123456789"; // Número por defecto si no hay ninguno configurado
  };

  // Generar mensaje de WhatsApp
  const getWhatsAppMessage = () => {
    let msg = `¡Hola! Quiero hacer un pedido:\n\n`;
    items.forEach((item) => {
      msg += `- ${item.menuItem.name} x${item.quantity} (${formatPrice(item.menuItem.price * item.quantity)})\n`;
    });
    msg += `\nTotal: ${formatPrice(totalPrice)}\n`;
    if (wantsDelivery) {
      msg += `\n*Tipo de pedido:* Delivery\n`;
      msg += `*Dirección y detalles:* ${deliveryDetails || "No especificado"}`;
    } else {
      msg += `\n*Tipo de pedido:* Para retirar en el local`;
    }
    return msg;
  };

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
          
          <div className="flex-grow overflow-auto p-4 bg-white shadow-lg rounded-b-3xl">
            {items.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium">Tu carrito está vacío</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Agrega algunos platos deliciosos para comenzar tu pedido.
                </p>
              </div>
            ) : (
              <ul className="space-y-6">
                {items.map((item) => (
                  <li 
                    key={item.id} 
                    className="flex items-start bg-white rounded-xl shadow border border-yellow-100 p-3 gap-3"
                  >
                    <div className="h-16 w-16 rounded-lg overflow-hidden mr-3 flex-shrink-0 border-2 border-yellow-300 shadow-sm">
                      <img 
                        src={item.menuItem.image} 
                        alt={item.menuItem.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-red-700 text-lg mb-1">{item.menuItem.name}</h4>
                      <p className="text-xs text-yellow-700 mb-2">USD {formatPrice(item.menuItem.price)}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border rounded-lg bg-yellow-50">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="px-2 h-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
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
                    <p className="font-bold text-lg ml-2 text-yellow-700">
                      USD {formatPrice(item.menuItem.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <SheetFooter className="px-4 py-5 border-t bg-yellow-50 rounded-b-3xl shadow-lg">
            <div className="w-full">
              <div className="flex justify-between text-lg font-extrabold mb-4 text-red-700">
                <span>Total:</span>
                <span>USD {formatPrice(totalPrice)}</span>
              </div>
              {/* Paso 1: Botón Continuar o formulario de delivery */}
              {!showDeliveryStep ? (
                <Button 
                  onClick={() => setShowDeliveryStep(true)}
                  className="w-full bg-primary hover:bg-primary/90 text-lg font-bold py-3 rounded-xl shadow-md transition-all duration-200" 
                  disabled={items.length === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Continuar
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-2">
                    <label className="font-bold text-base text-red-700">¿Desea Delivery?</label>
                    <Switch
                      checked={wantsDelivery}
                      onCheckedChange={setWantsDelivery}
                      className="data-[state=checked]:bg-yellow-400 data-[state=unchecked]:bg-gray-200 border-2 border-yellow-400"
                    />
                    <span className="text-sm font-semibold">{wantsDelivery ? "Sí" : "No"}</span>
                  </div>
                  {/* Mensaje de cargo extra por delivery, siempre visible */}
                  <p className={`flex items-center gap-2 text-xs mt-2 rounded px-2 py-1 border font-semibold ${wantsDelivery ? 'text-yellow-800 bg-yellow-100 border-yellow-400' : 'text-gray-500 bg-gray-100 border-gray-300'}`}>
                    <span className="text-lg">⚠️</span>
                    {wantsDelivery
                      ? 'Al seleccionar delivery se cobrará un cargo extra por el servicio.'
                      : 'Si eliges delivery, se cobrará un cargo extra por el servicio.'}
                  </p>
                  {wantsDelivery && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 shadow-sm">
                      <label className="block font-semibold mb-1 text-yellow-800">Dirección y detalles para el delivery</label>
                      <textarea
                        className="w-full border border-yellow-200 rounded-lg p-2 min-h-[80px] bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition"
                        placeholder={
                          "Envíame por favor tu dirección detallada escrita y de ser posible el GPS en tiempo actual al Whatsapp, número de teléfono de la persona que recibe y referencias para que nuestro delivery pueda llegar sin problemas a la dirección indicada 💚✍🏻"
                        }
                        value={deliveryDetails}
                        onChange={e => setDeliveryDetails(e.target.value)}
                      />
                    </div>
                  )}
                  <a
                    href={`https://wa.me/${getWhatsAppPhone()}?text=${encodeURIComponent(getWhatsAppMessage())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all duration-200">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Concretar pedido por WhatsApp
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
