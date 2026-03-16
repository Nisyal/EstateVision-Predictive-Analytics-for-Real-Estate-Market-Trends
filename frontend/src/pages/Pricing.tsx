import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
    Sparkles, Check, Crown, Zap, Shield, Star, Rocket, ArrowRight,
} from "lucide-react";

const plans = [
    {
        id: "free",
        label: "Free",
        price: 0,
        period: "",
        predictions: "5",
        icon: Zap,
        color: "from-slate-500 to-slate-600",
        features: ["5 predictions", "Basic ML model", "Standard support"],
        popular: false,
    },
    {
        id: "basic",
        label: "Basic",
        price: 299,
        period: "one-time",
        predictions: "50",
        icon: Star,
        color: "from-indigo-500 to-indigo-600",
        features: ["50 predictions", "Prediction history", "Forecast access", "Priority support"],
        popular: true,
    },
    {
        id: "pro",
        label: "Pro",
        price: 799,
        period: "one-time",
        predictions: "Unlimited",
        icon: Crown,
        color: "from-amber-500 to-orange-500",
        features: ["Unlimited predictions", "Full history & export", "Premium support", "API access", "Advanced analytics"],
        popular: false,
    },
];

export default function Pricing() {
    const { token, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [currentPlan, setCurrentPlan] = useState("free");
    const [usage, setUsage] = useState({ used: 0, limit: 5, remaining: 5 });
    const [loading, setLoading] = useState<string | null>(null);
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const handleStripeRedirect = async () => {
            if (params.get("success") && params.get("session_id") && token) {
                try {
                    const res = await fetch(`http://localhost:8004/plans/verify-session?session_id=${params.get("session_id")}`, {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                        setSuccess(`Successfully upgraded to ${params.get("plan")} plan!`);
                        const usageRes = await fetch("http://localhost:8004/predictions/usage", {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        if (usageRes.ok) {
                            const data = await usageRes.json();
                            setCurrentPlan(data.plan || "free");
                            setUsage(data);
                        }
                    }
                } catch (e) {
                    console.error("Failed to verify session:", e);
                }

                window.history.replaceState({}, document.title, "/pricing");
            } else if (params.get("canceled")) {
                window.history.replaceState({}, document.title, "/pricing");
            }
        };

        if (isAuthenticated && token) {
            handleStripeRedirect();

            if (!params.get("success")) {
                fetch("http://localhost:8004/predictions/usage", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                    .then((r) => r.json())
                    .then((data) => {
                        setCurrentPlan(data.plan || "free");
                        setUsage(data);
                    })
                    .catch(() => { });
            }
        }
    }, [isAuthenticated, token]);

    const handleUpgrade = async (planId: string) => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        if (planId === currentPlan || planId === "free") return;

        setLoading(planId);
        setSuccess("");
        try {
            const res = await fetch(`http://localhost:8004/plans/create-checkout-session?plan_id=${planId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Upgrade failed");

            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch {
            setSuccess("Failed to initiate checkout. Please try again.");
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen gradient-hero">
            <Navbar />

            <div className="pt-24 pb-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14 animate-slide-up">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-amber-500/20 border border-indigo-500/30 mb-6">
                            <Rocket className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium text-white/80">Choose Your Plan</span>
                        </div>
                        <h1 className="font-display text-4xl lg:text-5xl font-bold text-white mb-4">
                            Unlock More <span className="text-gradient-accent">Predictions</span>
                        </h1>
                        <p className="text-white/50 max-w-lg mx-auto">
                            Start free with 5 predictions. Need more? Upgrade anytime.
                        </p>

                        {isAuthenticated && (
                            <div className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-dark border border-white/10">
                                <span className="text-white/50 text-sm">Usage:</span>
                                <span className="text-white font-bold">{usage.used}</span>
                                <span className="text-white/30">/</span>
                                <span className="text-white/50">{usage.limit === 999999 ? "∞" : usage.limit}</span>
                                <span className="text-white/50 text-sm">predictions</span>
                                <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${currentPlan === "pro" ? "bg-amber-500/20 text-amber-400" :
                                    currentPlan === "basic" ? "bg-indigo-500/20 text-indigo-400" :
                                        "bg-white/10 text-white/60"
                                    }`}>
                                    {currentPlan.toUpperCase()}
                                </div>
                            </div>
                        )}
                    </div>

                    {success && (
                        <div className="max-w-md mx-auto mb-8 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-center text-sm animate-fade-in">
                            <Check className="w-5 h-5 inline mr-2" />{success}
                        </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-6 animate-slide-up">
                        {plans.map((plan) => {
                            const isCurrent = plan.id === currentPlan;
                            return (
                                <div
                                    key={plan.id}
                                    className={`relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 ${plan.popular
                                        ? "glass-dark border-2 border-indigo-500/50 shadow-primary-glow"
                                        : "glass-dark border border-white/10"
                                        }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-white text-xs font-bold">
                                            MOST POPULAR
                                        </div>
                                    )}

                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-5`}>
                                        <plan.icon className="w-6 h-6 text-white" />
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-1">{plan.label}</h3>
                                    <div className="flex items-baseline gap-1 mb-1">
                                        <span className="text-3xl font-bold text-white">
                                            {plan.price === 0 ? "Free" : `₹${plan.price}`}
                                        </span>
                                        {plan.period && (
                                            <span className="text-white/40 text-sm">/{plan.period}</span>
                                        )}
                                    </div>
                                    <p className="text-white/40 text-sm mb-6">
                                        {plan.predictions} predictions
                                    </p>

                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((f) => (
                                            <li key={f} className="flex items-center gap-2 text-sm">
                                                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                                <span className="text-white/70">{f}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {isCurrent ? (
                                        <Button disabled className="w-full h-11 rounded-xl bg-white/10 text-white/50 border-0 cursor-default">
                                            <Shield className="w-4 h-4 mr-2" /> Current Plan
                                        </Button>
                                    ) : plan.id === "free" ? (
                                        <Button disabled className="w-full h-11 rounded-xl bg-white/5 text-white/30 border-0 cursor-default">
                                            Default
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => handleUpgrade(plan.id)}
                                            disabled={loading === plan.id}
                                            className={`w-full h-11 rounded-xl font-semibold border-0 gap-2 ${plan.popular
                                                ? "gradient-primary text-white shadow-primary-glow"
                                                : "gradient-accent text-white shadow-accent-glow"
                                                }`}
                                        >
                                            {loading === plan.id ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    Upgrade Now <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <p className="text-center text-white/25 text-xs mt-10">
                        Payments are securely processed by Stripe.
                    </p>
                </div>
            </div>
        </div>
    );
}
