import { useQuery } from "@tanstack/react-query";
import { Staff, Settings } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { getPlaceholderImage } from "@/lib/utils";

export default function TeamSection() {
  const { data: staffMembers, isLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  // Obtener settings globales para visibilidad del staff
  const { data: settings } = useQuery<Settings[]>({
    queryKey: ["/api/settings"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  const isStaffEnabled = Array.isArray(settings)
    ? settings.find((s: Settings) => s.key === "isStaffEnabled")?.value === "true"
    : false;
  if (!isStaffEnabled) return null;

  return (
    <section id="nosotros" className="py-16 bg-gradient-to-br from-yellow-50 via-white to-red-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-red-600 drop-shadow-lg mb-3">
            Nuestro Equipo
          </h2>
          <p className="text-lg text-neutral-700 max-w-2xl mx-auto font-semibold">
            Conoce a las personas apasionadas que hacen posible la experiencia Pepito's House cada día.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {isLoading ? (
            // Loading skeletons
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="mb-4 rounded-full h-56 w-56 mx-auto" />
                <Skeleton className="h-6 w-40 mx-auto mb-2" />
                <Skeleton className="h-4 w-32 mx-auto mb-3" />
                <Skeleton className="h-4 w-48 mx-auto" />
              </div>
            ))
          ) : staffMembers && staffMembers.length > 0 ? (
            staffMembers.map((member) => (
              <div key={member.id} className="text-center bg-white rounded-3xl shadow-xl border-2 border-yellow-400 p-6 flex flex-col items-center">
                <div className="mb-4 rounded-full overflow-hidden h-44 w-44 border-4 border-red-400 shadow-lg">
                  <img 
                    src={member.image || getPlaceholderImage('person')} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-extrabold text-red-600 mb-1">{member.name}</h3>
                <p className="text-yellow-700 font-bold mb-2">{member.position}</p>
                <p className="text-neutral-700 px-4 font-medium">{member.bio}</p>
              </div>
            ))
          ) : (
            // Default team members if no data available
            <div className="col-span-full text-center py-8">
              <p className="text-red-500 text-xl font-bold">
                Información del equipo no disponible actualmente.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
