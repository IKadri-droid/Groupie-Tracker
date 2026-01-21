import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";

export const Route = createFileRoute("/cancel")({
    component: CancelComponent,
});

function CancelComponent() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-4">
            <Card className="w-full max-w-md bg-white/10 border-white/20 backdrop-blur-xl text-white shadow-2xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-red-400 to-pink-400" />
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-4">
                        <XCircle className="w-16 h-16 text-red-400" />
                    </div>
                    <CardTitle className="text-3xl font-bold">Paiement annulé</CardTitle>
                    <CardDescription className="text-slate-400">
                        L'opération de paiement a été annulée. Aucun montant n'a été débité de votre compte.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <Button
                        onClick={() => navigate({ to: "/" })}
                        variant="outline"
                        className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium py-6 rounded-xl transition-all active:scale-[0.98] shadow-xl group"
                    >
                        <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Retour à l'accueil
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
