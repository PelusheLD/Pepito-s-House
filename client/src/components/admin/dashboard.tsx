import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MenuItem, Category, Staff } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  UtensilsCrossed,
  Users,
  Tag,
  TrendingUp,
  ArrowRightCircle
} from "lucide-react";
import { Link } from "wouter";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export default function Dashboard() {
  // Fetch menu items to get statistics
  const { data: menuItems, isLoading: isLoadingMenu } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Fetch categories to show categories distribution
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Fetch staff to show team size
  const { data: staff, isLoading: isLoadingStaff } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Calculate counts and stats
  const totalMenuItems = menuItems?.length || 0;
  const availableItems = menuItems?.filter(item => item.isAvailable).length || 0;
  const featuredItems = menuItems?.filter(item => item.isFeatured).length || 0;
  const totalCategories = categories?.length || 0;
  const totalStaff = staff?.length || 0;

  // Prepare data for pie chart
  const getCategoryData = () => {
    if (!menuItems || !categories) return [];
    
    return categories.map(category => {
      const count = menuItems.filter(item => item.categoryId === category.id).length;
      return {
        name: category.name,
        value: count
      };
    }).filter(item => item.value > 0);
  };

  const categoryData = getCategoryData();
  const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display font-bold mb-6">Dashboard</h2>
        <p className="text-muted-foreground mb-8">
          Bienvenido al panel de administración. Aquí puedes ver un resumen de tu restaurante.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platos Totales</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingMenu ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalMenuItems}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {availableItems} disponibles
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platos Destacados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingMenu ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{featuredItems}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  En el menú del día
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingCategories ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalCategories}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Clasificaciones de menú
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Personal</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStaff ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalStaff}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Miembros del equipo
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts and detailed info */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Category Distribution Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Distribución de Menú por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingMenu || isLoadingCategories ? (
              <div className="flex justify-center items-center h-64">
                <Skeleton className="h-52 w-52 rounded-full" />
              </div>
            ) : categoryData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} platos`, 'Cantidad']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No hay datos suficientes para mostrar la distribución.
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Quick Links */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link href="/admin-aut/menu" className="flex items-center justify-between p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors">
                <div className="flex items-center">
                  <UtensilsCrossed className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <h4 className="font-medium">Gestionar Menú</h4>
                    <p className="text-sm text-muted-foreground">Añadir o editar platos</p>
                  </div>
                </div>
                <ArrowRightCircle className="h-5 w-5 text-primary" />
              </Link>
              
              <Link href="/admin-aut/settings" className="flex items-center justify-between p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors">
                <div className="flex items-center">
                  <Tag className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <h4 className="font-medium">Configurar Sitio</h4>
                    <p className="text-sm text-muted-foreground">Actualizar información</p>
                  </div>
                </div>
                <ArrowRightCircle className="h-5 w-5 text-primary" />
              </Link>
              
              <a href="/" target="_blank" className="flex items-center justify-between p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <h4 className="font-medium">Ver Sitio Web</h4>
                    <p className="text-sm text-muted-foreground">Vista pública del restaurante</p>
                  </div>
                </div>
                <ArrowRightCircle className="h-5 w-5 text-primary" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
