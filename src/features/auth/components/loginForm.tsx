import { Button } from "@/shared/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "@tanstack/react-router";
import { loginUser, useAuthStore } from "@/features/auth";
import { toast } from "sonner";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
// Schéma de validation Zod
const loginSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z
    .string()
    .min(8, { message: "Le mot de passe doit faire au moins 8 caractères" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // 2. Initialise le hook navigate
  const setLogin = useAuthStore((state) => state.setLogin);
  // La mutation TanStack Query
  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // 1. On enregistre dans l'état global
      setLogin({ email: data.user.email }, data.token); // Assuming data.user is an object with an email property
      toast.success("Connexion réussie ! Bienvenue " + data.user.email); // Display user's email
      navigate({ to: "/" }); //redirige vers page d'accueil
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: LoginFormValues) {
    mutation.mutate(data);
  }
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <Card className="w-full max-w-md bg-white/10 border-white/20 backdrop-blur-xl text-white shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-50 to-slate-400 bg-clip-text text-transparent">
            Connexion
          </CardTitle>
          <CardDescription className="text-slate-400">
            Entrez vos identifiants pour accéder à Groupie Tracker.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Le champ Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Email</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
                        placeholder="exemple@mail.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-pink-400" />
                  </FormItem>
                )}
              />

              {/* Le champ Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">
                      Mot de passe
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-white/20 transition-all pr-10"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-slate-400 hover:text-white transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-pink-400" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-[#1e293b] hover:bg-[#2d3a4f] text-white font-medium py-6 rounded-xl border border-white/10 transition-all active:scale-[0.98] shadow-xl"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-white/5 pt-6">
          <p className="text-sm text-slate-500">
            Pas encore de compte ?{" "}
            <Link
              to="/register"
              className="text-slate-300 hover:text-white font-medium transition-colors underline underline-offset-4"
            >
              Créer un compte
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
