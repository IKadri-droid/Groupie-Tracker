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
import { registerUser } from "@/features/auth";
import { toast } from "sonner";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { PasswordStrength } from "./passwordStrenght";

function getPasswordStrength(password: string): number {
  var score = 0;
  if (password.length > 0) score++;
  //test la longueur
  if (password.length > 8) score++;
  if (
    (/\d/.test(password) ||
      /[A-Z]/.test(password) ||
      /[^A-Za-z0-9]/.test(password)) &&
    password.length < 8
  ) {
    score--;
  }
  //test si contient chiffre
  if (/\d/.test(password)) score++;
  //test si contient majuscule
  if (/[A-Z]/.test(password)) score++;
  //test si contient caractères spécial
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score;
}

// Schéma de validation Zod
const registerSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z
    .string()
    .min(6, { message: "Le mot de passe doit faire au moins 6 caractères" }),
  username: z.string().min(3, {
    message: "Le nom d'utilisateur doit faire au moins 3 caractères",
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;
export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate(); // 2. Initialise le hook navigate
  const { executeRecaptcha } = useGoogleReCaptcha();
  // La mutation TanStack Query
  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success("Votre compte a bien été crée !");
      navigate({ to: "/login" }); //redirige vers page login
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    if (!executeRecaptcha) {
      toast.error("reCAPTCHA non disponible");
      return;
    }

    // Générer le token captcha
    const captchaToken = await executeRecaptcha("register");

    // Ajouter le token aux données
    mutation.mutate({
      ...data,
      captchaToken,
    });
  }
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <Card className="w-full max-w-md rounded-3xl bg-gradient-to-br from-white/15 via-white/5 to-white/10 border border-white/40 backdrop-blur-xl shadow-[inset_0_2px_3px_rgba(255,255,255,0.6),inset_0_-1px_2px_rgba(255,255,255,0.3),0_8px_32px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-50 to-slate-400 bg-clip-text text-transparent">
            Inscription
          </CardTitle>
          <CardDescription className="text-slate-400">
            Créez votre compte pour accéder à Groupie Tracker.
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
                          onChange={(e) => {
                            field.onChange(e);
                            setPasswordStrength(
                              getPasswordStrength(e.target.value),
                            );
                          }}
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

                    {/*Jauge de Niveau de sécurité*/}
                    <PasswordStrength
                      strength={passwordStrength}
                      value={form.watch("password")}
                    />
                    <FormMessage className="text-pink-400" />
                  </FormItem>
                )}
              />
              {/* Le champ Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">
                      Nom d'utilisateur
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
                        type="text"
                        placeholder="FanDeKalashCriminel"
                        {...field}
                      />
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
                {mutation.isPending ? "Création..." : "S'inscrire"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-white/5 pt-6">
          <p className="text-sm text-slate-500">
            Vous avez déjà un compte ?{" "}
            <Link
              to="/login"
              className="text-slate-300 hover:text-white font-medium transition-colors underline underline-offset-4"
            >
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
