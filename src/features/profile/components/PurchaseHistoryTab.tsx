import { useQuery } from "@tanstack/react-query";
import { getUserHistory, type OrderHistory } from "../api/profileApi";
import { useAuthStore } from "@/features/auth";
import { Card } from "@/shared/components/ui/card";
import {
  ShoppingBag,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
} from "lucide-react";

export function PurchaseHistoryTab() {
  const token = useAuthStore((state) => state.token);

  const {
    data: history,
    isLoading,
    error,
  } = useQuery<OrderHistory[]>({
    queryKey: ["purchase-history"],
    queryFn: () => getUserHistory(token || ""),
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error || !history || history.length === 0) {
    return (
      <Card className="bg-slate-900 border-white/10 text-white p-12 text-center">
        <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Aucun achat pour le moment</h3>
        <p className="text-slate-400">Vos futurs billets apparaîtront ici.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <ShoppingBag className="w-5 h-5 text-pink-500" />
        Historique de vos commandes
      </h2>

      <div className="grid gap-4">
        {history.map((order) => (
          <Card
            key={order.id}
            className="bg-slate-900/50 border-white/10 text-white overflow-hidden hover:bg-slate-900 transition-colors py-4"
          >
            <div className="flex flex-col md:flex-row">
              {/* Image Event */}
              <div className="w-full md:w-32 h-32 ml-4">
                <img
                  src={
                    order.image_concert ||
                    "https://stadibox.sfo2.digitaloceanspaces.com/Captura_de_pantalla_2025_04_17_a_la_s_10_07_53_p_m_8ef14b205f.png"
                  }
                  alt={order.venue}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              <div className="flex-1 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">{order.venue}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {order.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {order.location}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                  <div className="text-xl font-bold text-pink-500">
                    {order.amount.toFixed(2)} €
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      ID: #{order.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
