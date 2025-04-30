import { useQuery } from "@tanstack/react-query";
import { Staff } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { getPlaceholderImage } from "@/lib/utils";

export default function TeamSection() {
  const { data: staffMembers, isLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  return (
    <section id="nosotros" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-800 mb-3">
            Nuestro Equipo
          </h2>
          <p className="text-lg text-neutral-800/80 max-w-2xl mx-auto">
            Conoce a las personas apasionadas que hacen posible la experiencia LLAMAS! cada día.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
              <div key={member.id} className="text-center">
                <div className="mb-4 rounded-full overflow-hidden h-56 w-56 mx-auto">
                  <img 
                    src={member.image || getPlaceholderImage('person')} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-display font-bold">{member.name}</h3>
                <p className="text-primary font-medium mb-2">{member.position}</p>
                <p className="text-neutral-600 px-4">{member.bio}</p>
              </div>
            ))
          ) : (
            // Default team members if no data available
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground text-lg">
                Información del equipo no disponible actualmente.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
