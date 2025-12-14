
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export function FinalCTA() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [isSubscribing, setIsSubscribing] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubscribing(true);
        try {
            const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL.replace(/\/$/, '')}/api`;

            const response = await fetch(`${API_URL}/subscription/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Subscribed!",
                    description: "You have successfully subscribed to our newsletter.",
                });
                setEmail("");
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to subscribe.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive"
            });
        } finally {
            setIsSubscribing(false);
        }
    };


    return (
        <div className="relative w-full py-24 overflow-hidden bg-white text-slate-900 border-t">
            {/* Background Glow Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-blue-50/50 rounded-full blur-[120px] pointer-events-none opacity-50" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5 [mask-image:linear-gradient(180deg,black,rgba(0,0,0,0))]" />

            <div className="container relative z-10 mx-auto px-4 text-center">
                <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight max-w-4xl mx-auto text-slate-900">
                    Ready to modernize your classroom?
                </h2>

                <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Join 5,000+ educators saving time today. No credit card required.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                    <Button
                        size="lg"
                        onClick={() => navigate('/auth')}
                        className="bg-blue-600 text-white hover:bg-blue-700 text-lg px-8 py-6 h-auto shadow-xl shadow-blue-200 transition-all duration-300 transform hover:-translate-y-1 font-bold"
                    >
                        Start Free Trial
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </div>

                {/* Subscription Form */}
                <div className="max-w-md mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-slate-700 mb-4 text-sm font-medium">Or subscribe to our newsletter for updates</p>
                    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-offset-0 focus-visible:ring-blue-500"
                            required
                        />
                        <Button
                            type="submit"
                            variant="secondary"
                            disabled={isSubscribing}
                            className="whitespace-nowrap bg-slate-900 text-white hover:bg-slate-800"
                        >
                            {isSubscribing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4" /> Subscribe
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                <p className="mt-8 text-sm text-slate-500">
                    Free 14-day trial • Cancel anytime • GDPR Compliant
                </p>
            </div>
        </div>
    );
}
