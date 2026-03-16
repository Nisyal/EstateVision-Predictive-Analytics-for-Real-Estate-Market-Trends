import { useLocation, Link, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Brain, TrendingUp, ArrowLeft, Building, Sparkles, Target,
  IndianRupee, BarChart2, CheckCircle,
} from "lucide-react";

export default function Results() {
  const location = useLocation();
  const prediction = location.state?.predictionData;

  if (!prediction) {
    return <Navigate to="/predict" replace />;
  }

  const formatPrice = (val: number) => {
    if (val >= 100) {
      return `₹${(val / 100).toFixed(2)} Crores`;
    }
    return `₹${parseFloat(val.toString()).toFixed(2)} Lakhs`;
  };

  const priceDiff = prediction.hybrid_forecast_prediction - prediction.real_estate_prediction;
  const growthPct = ((priceDiff / prediction.real_estate_prediction) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-16">
        {/* Header */}
        <div className="text-center mb-14 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600">Analysis Complete</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Your Property <span className="text-gradient-primary">Valuation</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">Our AI models have analyzed your property details</p>
        </div>

        {/* Price cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8 animate-slide-up delay-100">
          {/* Market Value Card */}
          <div className="relative overflow-hidden bg-card rounded-3xl border border-border shadow-card p-8 group card-hover">
            <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <Building className="w-7 h-7 text-indigo-500" />
              </div>
              <span className="text-xs font-bold px-3 py-1.5 bg-indigo-500/10 text-indigo-600 rounded-full border border-indigo-500/20">
                Random Forest
              </span>
            </div>
            <p className="text-muted-foreground text-sm font-medium mb-2 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5" /> Current Market Value
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              {formatPrice(prediction.real_estate_prediction)}
            </h2>
          </div>

          {/* Future Trend Card */}
          <div className="relative overflow-hidden bg-card rounded-3xl border border-emerald-500/20 shadow-card p-8 group card-hover">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-emerald-500" />
              </div>
              <span className="text-xs font-bold px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">
                ARIMA Forecast
              </span>
            </div>
            <p className="text-muted-foreground text-sm font-medium mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Future Trend Valuation
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              {formatPrice(prediction.hybrid_forecast_prediction)}
            </h2>
          </div>
        </div>

        {/* Growth indicator */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6 mb-10 animate-slide-up delay-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <BarChart2 className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Forecasted Appreciation</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  {Number(growthPct) >= 0 ? "+" : ""}{growthPct}%{" "}
                  <span className="text-sm font-normal text-muted-foreground">projected growth</span>
                </p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-bold ${Number(growthPct) >= 0
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                : "bg-red-500/10 text-red-600 border border-red-500/20"
              }`}>
              {Number(growthPct) >= 0 ? "↑" : "↓"} {formatPrice(Math.abs(priceDiff))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-300">
          <Link to="/predict">
            <Button variant="outline" className="rounded-full px-8 h-12 border-border w-full sm:w-auto gap-2">
              <ArrowLeft className="w-4 h-4" /> Predict Another
            </Button>
          </Link>

          <Link to="/forecast" state={{ predictionData: prediction }}>
            <Button className="gradient-primary text-white font-semibold rounded-full px-8 h-12 w-full sm:w-auto shadow-primary-glow gap-2">
              <Sparkles className="w-4 h-4" /> View Market Forecast
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}