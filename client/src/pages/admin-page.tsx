import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRoute, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Dashboard from "@/components/admin/dashboard";
import MenuManagement from "@/components/admin/menu-management";
import SiteSettings from "@/components/admin/site-settings";
import ChangePassword from "@/components/admin/change-password";
import StaffManagement from "@/components/admin/staff-management";
import UserManagement from "@/components/admin/user-management";
import SocialMediaManagement from "@/components/admin/social-media-management";
import ReservationManagement from "@/components/admin/reservation-management";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Settings, 
  Lock, 
  LogOut,
  Menu,
  Users,
  UserCog,
  Share2,
  CalendarCheck
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Settings as SiteSettingsType } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

type Reservation = {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  message: string | null;
  status: string;
  createdAt: string;
};

export default function AdminPage() {
  const { user, logoutMutation } = useAuth();
  const [, params] = useRoute("/admin-aut/:section");
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: settings } = useQuery<SiteSettingsType[]>({
    queryKey: ["/api/settings"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: reservations } = useQuery<Reservation[]>({
    queryKey: ["/api/reservations"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const pendingReservations = reservations?.filter((r: Reservation) => r.status === "pending") || [];

  const getSettingValue = (key: string) => {
    if (!settings) return "";
    const setting = settings.find(s => s.key === key);
    return setting ? setting.value : "";
  };

  const restaurantName = getSettingValue("restaurantName") || "LLAMAS!";
  const restaurantLogo = getSettingValue("restaurantLogo") || "https://images.unsplash.com/photo-1656137002630-6da73c6d5b11?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjB8fGZpcmUlMjBsb2dvfGVufDB8fDB8fHww";

  useEffect(() => {
    // Si es primer inicio de sesión, forzar la pestaña de cambio de contraseña
    if (user?.isFirstLogin) {
      setActiveTab("change-password");
      setLocation("/admin-aut/change-password");
    } else if (params?.section) {
      // Si no estamos en una sección válida, redirigir al dashboard
      const validSections = ["dashboard", "menu", "settings", "change-password", "staff", "users", "social-media", "reservations"];
      if (validSections.includes(params.section)) {
        setActiveTab(params.section);
      } else {
        setActiveTab("dashboard");
        setLocation("/admin-aut/dashboard");
      }
    } else {
      // Si no hay sección especificada, ir al dashboard por defecto
      setActiveTab("dashboard");
      setLocation("/admin-aut/dashboard");
    }
  }, [params, user, setLocation]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setLocation(`/admin-aut/${value}`);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    setLocation("/auth");
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5 mr-2" /> },
    { id: "menu", label: "Gestión de Menú", icon: <UtensilsCrossed className="h-5 w-5 mr-2" /> },
    { 
      id: "reservations", 
      label: "Reservas", 
      icon: <CalendarCheck className="h-5 w-5 mr-2" />,
      badge: pendingReservations.length > 0 ? (
        <Badge variant="destructive" className="ml-2">
          {pendingReservations.length}
        </Badge>
      ) : null
    },
    { id: "staff", label: "Gestión de Personal", icon: <Users className="h-5 w-5 mr-2" /> },
    { id: "users", label: "Administrar Usuarios", icon: <UserCog className="h-5 w-5 mr-2" /> },
    { id: "social-media", label: "Redes Sociales", icon: <Share2 className="h-5 w-5 mr-2" /> },
    { id: "settings", label: "Configuración", icon: <Settings className="h-5 w-5 mr-2" /> },
    { id: "change-password", label: "Cambiar Contraseña", icon: <Lock className="h-5 w-5 mr-2" /> }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-secondary/10">
      {/* Header */}
      <header className="bg-white shadow-md z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src={restaurantLogo} 
              alt={`${restaurantName} Logo`} 
              className="h-10 w-10 rounded-full mr-2 object-cover" 
            />
            <h1 className="text-xl font-display font-bold text-primary hidden sm:block">
              {restaurantName} - Panel Admin
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="hidden sm:flex items-center"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Cerrar Sesión
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="block sm:hidden"
            >
              <Menu />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLocation("/")}
            >
              Ver Sitio
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar - desktop */}
        <aside className="w-64 bg-white shadow-md hidden sm:block">
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <Button
                    variant={activeTab === item.id ? "secondary" : "ghost"}
                    className={`w-full justify-start ${activeTab === item.id ? "bg-secondary/50 text-primary font-medium" : ""}`}
                    onClick={() => handleTabChange(item.id)}
                  >
                    {item.icon}
                    {item.label}
                    {item.badge}
                  </Button>
                </li>
              ))}
              <li className="pt-4 border-t mt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Cerrar Sesión
                </Button>
              </li>
            </ul>
          </nav>
        </aside>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white shadow-md z-20 sm:hidden">
            <nav className="p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <Button
                      variant={activeTab === item.id ? "secondary" : "ghost"}
                      className={`w-full justify-start ${activeTab === item.id ? "bg-secondary/50 text-primary font-medium" : ""}`}
                      onClick={() => handleTabChange(item.id)}
                    >
                      {item.icon}
                      {item.label}
                      {item.badge}
                    </Button>
                  </li>
                ))}
                <li className="pt-4 border-t mt-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Cerrar Sesión
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-1 p-4 sm:p-8">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="hidden">
              {menuItems.map((item) => (
                <TabsTrigger key={item.id} value={item.id}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="dashboard">
              <Dashboard />
            </TabsContent>
            
            <TabsContent value="menu">
              <MenuManagement />
            </TabsContent>
            
            <TabsContent value="settings">
              <SiteSettings />
            </TabsContent>
            
            <TabsContent value="staff">
              <StaffManagement />
            </TabsContent>
            
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="social-media">
              <SocialMediaManagement />
            </TabsContent>
            
            <TabsContent value="reservations">
              <ReservationManagement />
            </TabsContent>
            
            <TabsContent value="change-password">
              <ChangePassword isFirstLogin={user?.isFirstLogin} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
