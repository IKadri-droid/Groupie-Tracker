import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { loginUser } from "../api/auth"
import * as z from "zod"
import { useAuthStore } from "../store/authStore" // importe le store
import { toast } from "sonner" // 1. On importe "toast" (le messager)

// Import des nouveaux composants Shadcn
import { Button } from "../components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../components/ui/form"
import { Input } from "../components/ui/input"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../components/ui/card"

const loginSchema = z.object({
    email: z.string().email({ message: "Email invalide" }),
    password: z.string().min(8, { message: "Le mot de passe doit faire au moins 8 caractères" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const Route = createFileRoute('/login')({
    component: LoginComponent,
})

function LoginComponent() {
    const navigate = useNavigate() // 2. Initialise le hook navigate

    const setLogin = useAuthStore((state) => state.setLogin)
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })
    // La mutation TanStack Query
    const mutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            // 1. On enregistre dans l'état global
            setLogin({ email: data.user }, data.token)
            toast.success("Connexion réussie ! Bienvenue " + data.user)
            navigate({ to: '/' }) //redirige vers page d'accueil
        },
        onError: (error: Error) => {
            toast.error(error.message)
        }
    })


    function onSubmit(data: LoginFormValues) {
        mutation.mutate(data) // On lance l'appel API !
    }


    return (
        <div className="flex items-center justify-center min-h-[80vh] p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
                    <CardDescription>
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
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="exemple@mail.com" {...field} />
                                        </FormControl>
                                        <FormMessage /> {/* Les erreurs Zod s'affichent ici ! */}
                                    </FormItem>
                                )}
                            />

                            {/* Le champ Password */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mot de passe</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={mutation.isPending}>
                                {mutation.isPending ? "Connexion..." : "Se connecter"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Pas encore de compte ? Contactez un admin.
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}