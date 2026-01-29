import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";

export const Route = createFileRoute("/success")({
    validateSearch: (search: Record<string, unknown>) => {
        return {
            session_id: (search.session_id as string) || "",
        };
    },
    component: SuccessComponent,
});

function SuccessComponent() {
    const { session_id } = useSearch({ from: "/success" }) as { session_id?: string };
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const navigate = useNavigate();
    const hasRun = useRef(false);

    useEffect(() => {
        if (!session_id || hasRun.current) {
            return;
        }

        hasRun.current = true;
        const confirmPayment = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/confirm-payment", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ session_id }),
                });

                if (response.ok) {
                    setStatus("success");
                    toast.success("Paiement confirmé !");
                } else {
                    setStatus("error");
                    toast.error("Erreur lors de la confirmation du paiement.");
                }
            } catch (error) {
                console.error("Error confirming payment:", error);
                setStatus("error");
            }
        };

        confirmPayment();
    }, [session_id]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-4">
            <Card className="w-full max-w-md bg-white/10 border-white/20 backdrop-blur-xl text-white shadow-2xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-400" />
                <CardHeader className="text-center pb-2">
                    {status === "loading" && (
                        <div className="flex justify-center mb-4">
                            <Loader2 className="w-16 h-16 text-emerald-400 animate-spin" />
                        </div>
                    )}
                    {status === "success" && (
                        <div className="flex justify-center mb-4">
                            <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
                        </div>
                    )}
                    {status === "error" && (
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                                <span className="text-red-500 text-4xl font-bold">!</span>
                            </div>
                        </div>
                    )}
                    <CardTitle className="text-3xl font-bold">
                        {status === "loading" ? "Validation..." : status === "success" ? "Merci pour votre achat !" : "Oups !"}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        {status === "loading"
                            ? "Nous confirmons votre paiement auprès de Stripe..."
                            : status === "success"
                                ? "Votre commande a été validée avec succès. Vous allez recevoir un mail de confirmation."
                                : "Une erreur est survenue lors de la validation de votre paiement."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <Button
                        onClick={() => navigate({ to: "/" })}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-6 rounded-xl border border-white/10 transition-all active:scale-[0.98] shadow-xl group"
                    >
                        Retour à l'accueil
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
