import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Clock } from "lucide-react";

interface Activity {
  id: number;
  type: string;
  content: string;
  time: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="md:col-span-2 bg-slate-900 border-white/10 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          Activité Récente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 group">
              <div className="w-2 h-2 rounded-full bg-pink-500 group-hover:scale-150 transition-transform" />
              <div className="flex-1">
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-white">Vous</span>{" "}
                  {activity.content}
                </p>
                <span className="text-xs text-slate-500">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
