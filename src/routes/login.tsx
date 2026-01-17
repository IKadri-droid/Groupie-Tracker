import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/features/auth/components/loginForm";

// Import des nouveaux composants Shadcn

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});

function LoginComponent() {
  return <LoginForm />;
}
