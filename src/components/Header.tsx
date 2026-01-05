import { Link, useNavigate } from '@tanstack/react-router'

import { useState } from 'react'
import { Home, LogIn, LogOut, Menu, Network, User, X } from 'lucide-react'
import { Button } from './ui/button'
import { useAuthStore } from "../store/authStore"
import { toast } from "sonner" // Ajouté

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuthStore()

  // Fonction pour se déconnecter proprement avec une notification
  const handleLogout = () => {
    logout()
    toast.info("Vous avez été déconnecté")
  }

  return (
    <>
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-gray-800 text-white shadow-lg">
        {/* Bouton menu burger (à gauche) */}
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>


        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                className="hover:bg-transparent p-0 h-auto"
                title="Profil"
                asChild>
                <Link to="/profil">
                  <span className="text-sm font-medium bg-gray-700 px-3 py-1 rounded-full flex items-center gap-2">
                    <User size={16} />
                    {user}
                  </span>
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout} // Utilise la nouvelle fonction
                className="text-white hover:text-red-400"
                title="Déconnexion"
              >
                <LogOut size={20} />
              </Button>
            </div>
          ) : (
            <Button variant="outline" className="gap-2 text-black" asChild>
              <Link to="/login">
                <LogIn size={20} />
                Se connecter
              </Link>
            </Button>
          )}
        </div>
      </header >

      {/* Sidebar */}
      < aside
        className={`fixed top-0 left-0 h-full w-80 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`
        }
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Groupie Tracker</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <Home size={20} />
            <span className="font-medium">Accueil</span>
          </Link>

          {/* Demo Links Start */}

          <Link
            to="/demo/tanstack-query"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <Network size={20} />
            <span className="font-medium">TanStack Query</span>
          </Link>

          {/* Demo Links End */}
        </nav>
      </aside >
    </>
  )
}
