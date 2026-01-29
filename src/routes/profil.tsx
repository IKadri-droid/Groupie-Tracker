import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth";
import { useEffect, useState } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  Ticket,
  Calendar,
  MapPin,
  Music,
  ArrowRight,
  LogOut,
  History
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { toast } from "sonner";

interface ProfileData {
  username: string;
  email: string;
  role: string;
  order_count: number;
}

interface OrderHistory {
  id: number;
  amount: number;
  status: string;
  location: string;
  date: string;
  venue: string;
  concert_image?: string;
}

export const Route = createFileRoute("/profil")({
  component: ProfilePage,
});

function ProfilePage() {
  const { token, logout } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [history, setHistory] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate({ to: "/login" });
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch Profile Info
        const profileRes = await fetch("http://localhost:8080/api/profile", { headers });
        if (!profileRes.ok) {
          const errorText = await profileRes.text();
          console.error("Profile API Error:", profileRes.status, errorText);
          throw new Error(`Profile fetch failed: ${profileRes.status}`);
        }
        const profileData = await profileRes.json();

        // 2. Fetch Order History
        const historyRes = await fetch("http://localhost:8080/api/history", { headers });
        if (!historyRes.ok) {
          console.error("History API Error:", historyRes.status);
          throw new Error(`History fetch failed: ${historyRes.status}`);
        }
        const historyData = await historyRes.json();

        console.log("Profile Data loaded:", profileData);
        console.log("History Data loaded:", historyData);

        setProfile(profileData);
        setHistory(Array.isArray(historyData) ? historyData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Problème de connexion avec le serveur");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const handleLogout = () => {
    logout();
    toast.info("Déconnexion réussie");
    navigate({ to: "/" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-white/10 rounded-full"></div>
          <p className="text-slate-400">Chargement de votre univers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* COLONNE GAUCHE : INFOS USER */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-2xl text-white shadow-2xl overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <CardContent className="relative pt-16 pb-8 px-6 text-center">
              <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                <div className="w-32 h-32 rounded-3xl bg-slate-800 border-4 border-[#1e293b] flex items-center justify-center text-5xl shadow-2xl">
                  {profile?.username?.[0]?.toUpperCase() || "👤"}
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-1">{profile?.username}</h2>
              <p className="text-slate-400 flex items-center justify-center gap-2 mb-6">
                <Mail className="w-4 h-4" /> {profile?.email}
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3" /> {profile?.role}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Ticket className="w-3 h-3" /> {profile?.order_count} Billets
                </span>
              </div>

              <div className="space-y-3">
                {profile?.role === "admin" && (
                  <Button
                    onClick={() => navigate({ to: "/admin" })}
                    className="w-full bg-white text-black hover:bg-slate-200 rounded-xl font-bold py-6 transition-all"
                  >
                    Panel Administration 🛠️
                  </Button>
                )}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 rounded-xl py-6 transition-all group"
                >
                  <LogOut className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Déconnexion
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COLONNE DROITE : HISTORIQUE */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <History className="text-indigo-400" /> Historique des billets
            </h3>
            <span className="text-slate-500 text-sm font-medium">{history.length} commande(s)</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {history.length > 0 ? (
              history.map((order) => (
                <div
                  key={order.id}
                  className="group bg-white/5 border border-white/10 hover:border-white/20 p-5 rounded-2xl transition-all duration-300 flex items-center gap-6"
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-2xl shadow-inner border border-white/5">
                    🏟️
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-lg text-white">Concert à {order.location}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase ${order.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-orange-500/20 text-orange-400 border border-orange-500/50'}`}>
                        {order.status === 'paid' ? 'Payé' : 'En attente'}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {order.date}</span>
                      <span className="flex items-center gap-1.5 font-medium text-slate-300"><MapPin className="w-3.5 h-3.5" /> {order.venue}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-white">{order.amount.toFixed(2)}€</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ticket #{order.id}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🎧</div>
                <h4 className="text-white font-bold text-lg">Aucun billet trouvé</h4>
                <p className="text-slate-400 text-sm mb-6">Il est temps de réserver votre prochain concert !</p>
                <Button
                  onClick={() => navigate({ to: "/" })}
                  className="bg-indigo-500 hover:bg-indigo-600 rounded-full px-8"
                >
                  Explorer les artistes <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
