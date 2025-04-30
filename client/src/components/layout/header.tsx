import { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Menu,
  X
} from "lucide-react";

type HeaderProps = {
  logo: string;
  restaurantName: string;
};

export default function Header({ logo, restaurantName }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { openCart, totalItems } = useCart();

  // Handle scroll for sticky header effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking on a navigation link
  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 ${
      isScrolled ? "bg-white shadow-md" : "bg-white shadow-sm"
    } transition-all duration-300`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center relative">
        {/* Logo a la izquierda */}
        <Link href="/" className="flex items-center">
          <img 
            src={logo} 
            alt={`${restaurantName} Logo`} 
            className="h-12 w-auto mr-3 rounded-full shadow object-cover" 
          />
        </Link>
        
        {/* Título centrado */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-2xl font-display font-bold text-primary">{restaurantName}</h1>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#inicio" className="text-neutral-800 hover:text-primary font-medium transition-colors">
            Inicio
          </a>
          <a href="#menu" className="text-neutral-800 hover:text-primary font-medium transition-colors">
            Menú
          </a>
          <a href="#ubicacion" className="text-neutral-800 hover:text-primary font-medium transition-colors">
            Ubicación
          </a>
          <a href="#nosotros" className="text-neutral-800 hover:text-primary font-medium transition-colors">
            Nosotros
          </a>
          <Button 
            onClick={openCart}
            className="bg-primary text-white hover:bg-primary/90 transition-colors relative"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            <span>Carrito</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <Button 
            variant="ghost"
            size="icon"
            className="relative mr-2"
            onClick={openCart}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col space-y-3">
              <a 
                href="#inicio" 
                className="text-neutral-800 hover:text-primary font-medium py-2 transition-colors"
                onClick={handleNavClick}
              >
                Inicio
              </a>
              <a 
                href="#menu" 
                className="text-neutral-800 hover:text-primary font-medium py-2 transition-colors"
                onClick={handleNavClick}
              >
                Menú
              </a>
              <a 
                href="#ubicacion" 
                className="text-neutral-800 hover:text-primary font-medium py-2 transition-colors"
                onClick={handleNavClick}
              >
                Ubicación
              </a>
              <a 
                href="#nosotros" 
                className="text-neutral-800 hover:text-primary font-medium py-2 transition-colors"
                onClick={handleNavClick}
              >
                Nosotros
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
