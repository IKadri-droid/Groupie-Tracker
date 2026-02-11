import { Button } from "@/shared/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { MapPin, Music2, CalendarDays } from "lucide-react";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { ActivityFeed } from "@/features/profile/components/ActivityFeed";
import { NextConcertCard } from "@/features/profile/components/NextConcertCard";
import { FavoritesTab } from "@/features/profile/components/FavoritesTab";
import { SettingsTab } from "@/features/profile/components/SettingsTab";
import { PurchaseHistoryTab } from "@/features/profile/components/PurchaseHistoryTab";

export const Route = createFileRoute("/profil")({
  component: RouteComponent,
});

// Mock Data pour les stats et l'activité
const MOCK_STATS = [
  { label: "Concerts", value: 12, icon: CalendarDays, color: "text-blue-400" },
  {
    label: "Artistes Favoris",
    value: 48,
    icon: Music2,
    color: "text-pink-400",
  },
  { label: "Lieux visités", value: 7, icon: MapPin, color: "text-green-400" },
];

const RECENT_ACTIVITY = [
  { id: 1, type: "like", content: "avez aimé Queen", time: "Hier" },
  {
    id: 2,
    type: "concert",
    content: "avez participé au concert de Coldplay",
    time: "Il y a 2 jours",
  },
  {
    id: 3,
    type: "comment",
    content: "avez commenté sur AC/DC",
    time: "Il y a 5 jours",
  },
];

export function RouteComponent() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <h1 className="text-2xl font-bold mb-4">
          Vous devez être connecté pour voir cette page.
        </h1>
        <Link to="/login">
          <Button variant="outline">Se connecter</Button>
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pb-20 pt-28 md:pt-40 px-4 sm:px-8">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto mb-10">
        <ProfileHeader user={user} mockStats={MOCK_STATS} />
      </div>

      {/* Main Content Tabs */}
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-slate-800/50 border border-white/10 p-1 rounded-xl mb-8 flex flex-nowrap overflow-x-auto overflow-y-hidden justify-start md:justify-center gap-2 no-scrollbar h-auto">
            <TabsTrigger
              value="overview"
              className="shrink-0 data-[state=active]:bg-pink-500 data-[state=active]:text-white rounded-lg px-4 py-2 md:px-6 text-sm md:text-base"
            >
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="shrink-0 data-[state=active]:bg-pink-500 data-[state=active]:text-white rounded-lg px-4 py-2 md:px-6 text-sm md:text-base"
            >
              Favoris
            </TabsTrigger>
            <TabsTrigger
              value="purchases"
              className="shrink-0 data-[state=active]:bg-pink-500 data-[state=active]:text-white rounded-lg px-4 py-2 md:px-6 text-sm md:text-base"
            >
              Achats
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="shrink-0 data-[state=active]:bg-pink-500 data-[state=active]:text-white rounded-lg px-4 py-2 md:px-6 text-sm md:text-base"
            >
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Activity Feed */}
              <ActivityFeed activities={RECENT_ACTIVITY} />

              {/* Suggestions / Side Widget */}
              <NextConcertCard />
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <FavoritesTab />
          </TabsContent>

          <TabsContent value="purchases">
            <PurchaseHistoryTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab email={user.email} onLogout={handleLogout} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
