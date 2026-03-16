import heroBg from "@/assets/hero-bg.jpg";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Brain,
  TrendingUp,
  BarChart2,
  Shield,
  Zap,
  Database,
  ArrowRight,
  MapPin,
  Star,
  ChevronRight,
  Sparkles,
  Target,
  BookOpen,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Market Intelligence Engine",
    desc: "Random Forest & Gradient Boosting models trained on 100K+ real estate records across India.",
    accent: "from-indigo-500 to-purple-600",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-500",
  },
  {
    icon: TrendingUp,
    title: "Market Forecasting",
    desc: "ARIMA time-series analysis predicts future market trends with confidence bands up to 10 years.",
    accent: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: BarChart2,
    title: "Feature Intelligence",
    desc: "Understand exactly which property attributes — location, size, age — drive your predicted price.",
    accent: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: Shield,
    title: "High Confidence",
    desc: "Every prediction comes with reliability scoring so you know the accuracy of the estimate.",
    accent: "from-sky-500 to-blue-600",
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-500",
  },
  {
    icon: Zap,
    title: "Real-Time Results",
    desc: "Sub-second prediction latency via an optimized ML inference pipeline deployed on cloud.",
    accent: "from-violet-500 to-indigo-600",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-500",
  },
  {
    icon: Database,
    title: "Smart Preprocessing",
    desc: "Automated data cleaning, log transforms, normalization, and feature engineering built into the pipeline.",
    accent: "from-rose-500 to-pink-600",
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-500",
  },
];

const stats = [
  { value: "98.2%", label: "R² Score", sub: "Prediction Accuracy" },
  { value: "100K+", label: "Training Records", sub: "Validated Dataset" },
  { value: "<0.5s", label: "Latency", sub: "API Response Time" },
  { value: "10yr", label: "Forecast", sub: "Future Outlook" },
];

const pipelineSteps = [
  { num: "01", title: "Input", desc: "Property details via form", icon: MapPin },
  { num: "02", title: "Preprocessing", desc: "Scaling & encoding", icon: Database },
  { num: "03", title: "ML Model", desc: "Random Forest inference", icon: Brain },
  { num: "04", title: "Prediction", desc: "Price in ₹ Lakhs", icon: Target },
  { num: "05", title: "Forecast", desc: "ARIMA trend analysis", icon: TrendingUp },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 gradient-hero opacity-90" />
          <div className="absolute inset-0 dot-grid opacity-20" />
        </div>

        {/* Ambient blobs */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl animate-float" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl animate-float delay-300" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl animate-float delay-500" />

        <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-20 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </span>
              <span className="text-amber-300 text-sm font-medium">Real Estate Market Intelligence Engine</span>
            </div>

            <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1]">
              Predict House
              <br />
              <span className="text-gradient-accent">Prices</span> with
              <br />
              ML Precision
            </h1>

            <p className="text-lg text-white/60 max-w-lg leading-relaxed">
              Our machine learning pipeline analyzes 22+ property features to deliver
              accurate price predictions and future market forecasts — in under a second.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/predict">
                <Button
                  size="lg"
                  className="gradient-accent text-white font-semibold shadow-accent-glow hover:shadow-none transition-all duration-300 border-0 gap-2 px-8 rounded-full text-base"
                >
                  Start Predicting <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/docs">
                <Button
                  size="lg"
                  variant="outline"
                  className="glass-dark border-white/15 text-white hover:bg-white/10 gap-2 px-8 rounded-full text-base"
                >
                  Documentation <BookOpen className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Mini stats */}
            <div className="flex gap-8 pt-4">
              {[
                { v: "98%", l: "Accuracy" },
                { v: "100K+", l: "Records" },
                { v: "<1s", l: "Speed" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <div className="font-display font-bold text-2xl text-amber-400">{s.v}</div>
                  <div className="text-xs text-white/50 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating prediction card */}
          <div className="relative animate-slide-up delay-300 hidden lg:block">
            <div className="glass-dark rounded-3xl p-7 shadow-elevated animate-float">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-white/50 text-sm">Predicted Price</p>
                  <p className="font-display font-bold text-4xl text-white mt-1">₹ 85.4 L</p>
                </div>
                <div className="w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center shadow-accent-glow">
                  <Brain className="w-7 h-7 text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-sm">Confidence</span>
                  <span className="text-amber-400 font-semibold">94.2%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full gradient-accent w-[94%] transition-all duration-1000" />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  { label: "Location", val: "Koramangala" },
                  { label: "Area", val: "1,450 sqft" },
                  { label: "Type", val: "3 BHK Apt" },
                  { label: "Age", val: "2 years" },
                ].map((item) => (
                  <div key={item.label} className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-white/40 text-xs">{item.label}</p>
                    <p className="text-white font-medium text-sm mt-0.5">{item.val}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/25">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium">+12.3% forecasted growth · 12 months</span>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 glass-dark rounded-2xl px-4 py-3 shadow-elevated">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-white text-sm font-medium">R² = 0.98</span>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 glass-dark rounded-2xl px-4 py-3 shadow-elevated">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span className="text-white text-sm font-medium">50+ Cities</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section className="relative -mt-1">
        <div className="max-w-6xl mx-auto px-6">
          <div className="gradient-primary rounded-3xl p-1">
            <div className="bg-card rounded-[calc(1.5rem-2px)] px-8 py-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="font-display font-bold text-4xl text-gradient-primary">{s.value}</div>
                    <div className="text-foreground font-semibold mt-1">{s.label}</div>
                    <div className="text-muted-foreground text-sm">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-28 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary mb-4">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-muted-foreground">Powerful Features</span>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground">
              Everything You Need to
              <br />
              <span className="text-gradient-primary">Predict & Forecast</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
              A complete ML system for real estate valuation, market analysis, and future price forecasting.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group relative bg-card rounded-2xl border border-border p-7 shadow-card card-hover animate-slide-up overflow-hidden"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Hover gradient line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className={`w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={`w-6 h-6 ${f.iconColor}`} />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PIPELINE ─── */}
      <section className="py-28 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-15" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white">
              How the <span className="text-gradient-accent">Pipeline</span> Works
            </h2>
            <p className="text-white/50 mt-4 max-w-lg mx-auto text-lg">
              From raw input to intelligent prediction — our end-to-end ML architecture.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-0">
            {pipelineSteps.map((step, i) => (
              <div key={step.num} className="flex md:flex-row flex-col items-center gap-4 flex-1">
                <div className="glass-dark rounded-2xl p-6 text-center flex-1 card-hover min-w-[150px] group">
                  <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-display font-bold text-amber-400 text-sm tracking-wider">{step.num}</div>
                  <div className="text-white font-semibold mt-1">{step.title}</div>
                  <div className="text-white/40 text-xs mt-1">{step.desc}</div>
                </div>
                {i < pipelineSteps.length - 1 && (
                  <ChevronRight className="w-6 h-6 text-amber-400/40 hidden md:block flex-shrink-0 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-28 bg-background">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="animated-border rounded-3xl p-10 bg-card">
            <Sparkles className="w-10 h-10 text-indigo-500 mx-auto mb-6" />
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Ready to Predict Your
              <br />
              <span className="text-gradient-accent">Property Value?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Enter your property details and get a market intelligence valuation in seconds.
            </p>
            <Link to="/predict">
              <Button
                size="lg"
                className="gradient-accent text-white font-semibold shadow-accent-glow hover:shadow-none transition-all duration-300 border-0 gap-2 px-10 py-6 text-base rounded-full"
              >
                Get Your Prediction <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/80 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-foreground">
              House<span className="text-gradient-primary">AI</span>
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            EstateEdge – Real Estate Market Intelligence Engine · Final Year Project
          </p>
        </div>
      </footer>
    </div>
  );
}
