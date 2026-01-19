import { RegisterForm } from "@/features/auth/components/register/registerForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  component: RouteComponent,
});

function RouteComponent() {
  return <RegisterForm />;
}
