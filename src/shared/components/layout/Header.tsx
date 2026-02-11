import { Link } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth";
import { toast } from "sonner";
import { motion, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Header() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.info("Vous avez été déconnecté");
  };

  return (
    <header
      className="fixed left-1/2 -translate-x-1/2 z-50"
      style={{ top: "calc(env(safe-area-inset-top) + 24px)" }}
    >
      <LayoutGroup>
        <nav className="flex items-center gap-1 p-1.5 rounded-full bg-gradient-to-br from-white/15 via-white/5 to-white/10 border border-white/40 backdrop-blur-xl shadow-[inset_0_2px_3px_rgba(255,255,255,0.6),inset_0_-1px_2px_rgba(255,255,255,0.3),0_8px_32px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)]">
          {/* Navigation items */}
          <Link
            to="/"
            className="relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 group"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-white rounded-full shadow-lg"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    initial={false}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex items-center gap-2 transition-colors duration-300",
                    isActive
                      ? "text-black font-semibold"
                      : "text-slate-400 group-hover:text-white",
                  )}
                >
                  ACCUEIL
                </span>
              </>
            )}
          </Link>

          {/* Separator if needed, or just gap */}

          {user ? (
            <>
              <Link
                to="/profil"
                className="relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 group"
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-white rounded-full shadow-lg"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                        initial={false}
                      />
                    )}
                    <span
                      className={cn(
                        "relative z-10 flex items-center gap-2 uppercase transition-colors duration-300",
                        isActive
                          ? "text-black font-semibold"
                          : "text-slate-400 group-hover:text-white",
                      )}
                    >
                      Profil
                    </span>
                  </>
                )}
              </Link>

              {user.email === "AdminGroupie@groupie.com" && (
                <Link
                  to="/admin"
                  className="relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 group"
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="active-pill"
                          className="absolute inset-0 bg-white rounded-full shadow-lg"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                          initial={false}
                        />
                      )}
                      <span
                        className={cn(
                          "relative z-10 flex items-center gap-2 uppercase transition-colors duration-300",
                          isActive
                            ? "text-black font-semibold"
                            : "text-slate-400 group-hover:text-white",
                        )}
                      >
                        Admin
                      </span>
                    </>
                  )}
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="px-6 py-2.5 rounded-full text-sm font-medium text-slate-400 hover:text-red-400 transition-colors uppercase"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 group"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-white rounded-full shadow-lg"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                      initial={false}
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 flex items-center gap-2 uppercase transition-colors duration-300",
                      isActive
                        ? "text-black font-semibold"
                        : "text-slate-400 group-hover:text-white",
                    )}
                  >
                    Login
                  </span>
                </>
              )}
            </Link>
          )}
        </nav>
      </LayoutGroup>
    </header>
  );
}
