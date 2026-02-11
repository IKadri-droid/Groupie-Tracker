import {
  Outlet,
  createRootRouteWithContext,
  Link,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import Header from "../shared/components/layout/Header";
import { Toaster } from "@/shared/components/ui/sonner"; // Ajouté

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="w-full py-6 px-4 border-t border-white/5 bg-[#0f172a] text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Groupie Tracker. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link to="/legal" className="hover:text-white transition-colors">
              Mentions Légales
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Politique de Confidentialité
            </Link>
          </div>
        </div>
      </footer>
      <Toaster /> {/* Le conteneur de notifications */}
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
          TanStackQueryDevtools,
        ]}
      />
    </>
  ),
});
