import { Link } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth";
import { toast } from "sonner";

export default function Header() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.info("Vous avez été déconnecté");
  };

  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <nav className="flex items-center gap-1 p-1.5 rounded-full  backdrop-blur-lg bg-white/30 dark:bg-black/30 border border-white/10 shadow-2xl">
        {/* Navigation items */}
        <Link
          to="/"
          className="relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:text-gray-600 text-black"
          activeProps={{
            className:
              "bg-white text-black shadow-lg hover:text-black font-semibold",
          }}
        >
          <span className="flex items-center gap-2">ACCUEIL</span>
        </Link>

        {/* Separator if needed, or just gap */}

        {user ? (
          <>
            <Link
              to="/profil"
              className="relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:text-white text-slate-400"
              activeProps={{
                className:
                  "bg-white text-black shadow-lg hover:text-black font-semibold",
              }}
            >
              <span className="flex items-center gap-2 uppercase">Profile</span>
            </Link>

            {user.email === "AdminGroupie@groupie.com" && (
              <Link
                to="/admin"
                className="relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:text-white text-slate-400"
                activeProps={{
                  className:
                    "bg-white text-black shadow-lg hover:text-black font-semibold",
                }}
              >
                <span className="flex items-center gap-2 uppercase">Admin</span>
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
            className="relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:text-white text-slate-400"
            activeProps={{
              className:
                "bg-white text-black shadow-lg hover:text-black font-semibold",
            }}
          >
            <span className="flex items-center gap-2 uppercase">Login</span>
          </Link>
        )}
      </nav>
    </header>
  );
}
