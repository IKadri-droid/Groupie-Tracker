import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";
import { Card, CardContent } from "@/shared/components/ui/card";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth";

export const Route = createFileRoute("/profil")({
  component: RouteComponent,
});

export function RouteComponent() {
  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <h1 className="text-2xl font-bold mb-4">
        Bienvenue sur ton profil, {useAuthStore((state) => state.user?.email)}
      </h1>

      {/* Bouton Admin visible uniquement pour les administrateurs */}
      {useAuthStore((state) => state.user?.role) === "admin" && (
        <Link
          to="/admin"
          className="mb-10 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg"
        >
          Accéder au Panel Admin 🛠️
        </Link>
      )}

      <h2 className="text-xl font-bold mb-5">Tes musiques préférées</h2>
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full max-w-sm"
      >
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <span className="text-3xl font-semibold">{index + 1}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
