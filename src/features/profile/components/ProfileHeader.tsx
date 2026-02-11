import { User } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileHeaderProps {
  user: any; // TODO: Use proper User type
  mockStats: Array<{ label: string; value: number; icon: any; color: string }>;
}

export function ProfileHeader({ user, mockStats }: ProfileHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 border border-white/10 shadow-2xl overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 p-1">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
              <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
                {(user.username || user.email).charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          {user.role === "admin" && (
            <span className="absolute bottom-0 right-0 bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full border-2 md:border-4 border-slate-900 shadow-sm">
              ADMIN
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 break-all">
            {user.username || user.email.split("@")[0]}
          </h1>
          <p className="text-slate-400 mb-4 flex items-center justify-center md:justify-start gap-2 text-sm md:text-base">
            <User className="w-4 h-4" /> Membre depuis 2024
          </p>
        </div>

        {/* Quick Stats (Hero) */}
        <div className="flex w-full md:w-auto justify-center gap-4 md:gap-6 divide-x divide-white/10">
          {mockStats.map((stat, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center px-4 ${idx === 0 ? "pl-0" : ""}`}
            >
              <span className={`text-xl md:text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </span>
              <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
