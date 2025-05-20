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
    <header className={`sticky top-0 z-50 border-b-4 border-yellow-400 shadow-lg ${
      isScrolled ? "bg-white/95" : "bg-white"
    } transition-all duration-300`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <img 
            src={logo} 
            alt={`${restaurantName} Logo`} 
            className="h-14 w-14 mr-3 rounded-full shadow-lg border-4 border-yellow-400 object-cover bg-white" 
          />
          <h1 className="text-3xl font-extrabold text-red-600 drop-shadow-lg tracking-tight">{restaurantName}</h1>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#inicio" className="relative text-yellow-700 hover:text-red-600 font-bold text-lg transition-colors group">
            Inicio
            <span className="absolute bottom-0 left-0 w-0 h-1 bg-yellow-400 transition-all duration-300 group-hover:w-full rounded-full"></span>
          </a>
          <a href="#menu" className="relative text-yellow-700 hover:text-red-600 font-bold text-lg transition-colors group">
            Menú
            <span className="absolute bottom-0 left-0 w-0 h-1 bg-yellow-400 transition-all duration-300 group-hover:w-full rounded-full"></span>
          </a>
          <a href="#ubicacion" className="relative text-yellow-700 hover:text-red-600 font-bold text-lg transition-colors group">
            Ubicación
            <span className="absolute bottom-0 left-0 w-0 h-1 bg-yellow-400 transition-all duration-300 group-hover:w-full rounded-full"></span>
          </a>
          <a href="#nosotros" className="relative text-yellow-700 hover:text-red-600 font-bold text-lg transition-colors group">
            Nosotros
            <span className="absolute bottom-0 left-0 w-0 h-1 bg-yellow-400 transition-all duration-300 group-hover:w-full rounded-full"></span>
          </a>
          <Button 
            onClick={openCart}
            className="bg-red-600 text-white hover:bg-yellow-400 hover:text-red-700 font-bold text-lg px-6 py-2 rounded-full shadow-lg border-2 border-yellow-400 transition-all duration-200 relative"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            <span>Carrito</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-red-600">
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
            <ShoppingCart className="h-6 w-6 text-red-600" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-red-600">
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
              <X className="h-6 w-6 text-red-600" />
            ) : (
              <Menu className="h-6 w-6 text-yellow-500" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t-2 border-yellow-400">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col space-y-3">
              <a 
                href="#inicio" 
                className="relative text-yellow-700 hover:text-red-600 font-bold text-lg py-2 transition-colors group"
                onClick={handleNavClick}
              >
                Inicio
                <span className="absolute bottom-0 left-0 w-0 h-1 bg-yellow-400 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </a>
              <a 
                href="#menu" 
                className="relative text-yellow-700 hover:text-red-600 font-bold text-lg py-2 transition-colors group"
                onClick={handleNavClick}
              >
                Menú
                <span className="absolute bottom-0 left-0 w-0 h-1 bg-yellow-400 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </a>
              <a 
                href="#ubicacion" 
                className="relative text-yellow-700 hover:text-red-600 font-bold text-lg py-2 transition-colors group"
                onClick={handleNavClick}
              >
                Ubicación
                <span className="absolute bottom-0 left-0 w-0 h-1 bg-yellow-400 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </a>
              <a 
                href="#nosotros" 
                className="relative text-yellow-700 hover:text-red-600 font-bold text-lg py-2 transition-colors group"
                onClick={handleNavClick}
              >
                Nosotros
                <span className="absolute bottom-0 left-0 w-0 h-1 bg-yellow-400 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
