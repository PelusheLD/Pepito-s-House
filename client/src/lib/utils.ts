import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Generate a placeholder image URL
export function getPlaceholderImage(type: 'food' | 'person' | 'restaurant' = 'food'): string {
  const placeholders = {
    food: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60',
    person: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=60',
    restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80'
  };
  
  return placeholders[type];
}

// Get URL for WhatsApp with formatted message
export function getWhatsAppUrl(items: Array<{ name: string; price: number; quantity: number }>, totalPrice: number): string {
  let message = 'Hola, quiero hacer un pedido:%0A%0A';
  
  items.forEach(item => {
    message += `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}%0A`;
  });
  
  message += `%0ATotal: $${totalPrice.toFixed(2)}`;
  
  return `https://wa.me/1234567890?text=${message}`;
}

// Function to slugify text
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}
