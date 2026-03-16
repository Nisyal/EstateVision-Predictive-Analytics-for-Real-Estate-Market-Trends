import Navbar from "@/components/Navbar";
import {
    Brain, Database, TrendingUp, Zap, Code2, GitBranch,
    Layers, ArrowRight, CheckCircle, Sparkles, BarChart2,
    Server, Globe, FileText, Users, Target, Cpu, BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const sections = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "architecture", label: "Architecture", icon: Layers },
    { id: "models", label: "ML Models", icon: Brain },
    { id: "tech-stack", label: "Tech Stack", icon: Code2 },
    { id: "how-to-use", label: "How to Use", icon: Target },
    { id: "dataset", label: "Dataset", icon: Database },
];

const techStack = [
    { category: "Frontend", items: ["React 18", "TypeScript", "Vite", "Tailwind CSS", "Shadcn/UI", "Recharts"], icon: Globe, color: "from-indigo-500 to-purple-600" },
    { category: "Backend", items: ["Python", "FastAPI", "Uvicorn", "Pydantic"], icon: Server, color: "from-emerald-500 to-teal-600" },
    { category: "ML / AI", items: ["Scikit-learn", "Pandas", "NumPy", "Joblib", "ARIMA (statsmodels)"], icon: Brain, color: "from-amber-500 to-orange-600" },
    { category: "DevOps", items: ["Git", "Docker", "Render / Hugging Face", "Git LFS"], icon: GitBranch, color: "from-rose-500 to-pink-600" },
];

const howToSteps = [
    {
        num: "01",
        title: "Enter Property Details",
        desc: "Navigate to the Predict page and fill in your property's location (State, City, Locality), type, size, BHK, year built, and more across a 3-step form.",
        icon: FileText,
    },
    {
        num: "02",
        title: "AI Processes Your Input",
        desc: "Your data is sent to the FastAPI backend where it goes through preprocessing — log transforms, encoding, scaling — before being fed into the trained Random Forest model.",
        icon: Cpu,
    },
    {
        num: "03",
        title: "Get Instant Prediction",
        desc: "The model returns the predicted house price in ₹ Lakhs. The ARIMA forecast model also provides a future trend estimate.",
        icon: Target,
    },
    {
        num: "04",
        title: "Explore Market Forecast",
        desc: "View an interactive chart showing projected price movement over 6 months to 10 years, with growth decay modeling and confidence bands.",
        icon: TrendingUp,
    },
];

const datasetFeatures = [
    "State", "City", "Locality", "Property Type", "BHK", "Size (SqFt)",
    "Price per SqFt", "Year Built", "Furnished Status", "Floor No",
    "Total Floors", "Age of Property", "Nearby Schools", "Nearby Hospitals",
    "Public Transport", "Parking", "Security", "Amenities", "Facing",
    "Owner Type", "Availability Status", "Price in Lakhs (Target)",
];

export default function Documentation() {
    const [activeSection, setActiveSection] = useState("overview");

    const scrollTo = (id: string) => {
        setActiveSection(id);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
                <div className="flex gap-8">
                    {/* Sidebar nav — sticky */}
                    <aside className="hidden lg:block w-56 flex-shrink-0">
                        <div className="sticky top-28 space-y-1">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-3">On this page</p>
                            {sections.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => scrollTo(s.id)}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${activeSection === s.id
                                        ? "gradient-primary text-white shadow-primary-glow"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                        }`}
                                >
                                    <s.icon className="w-4 h-4" />
                                    {s.label}
                                </button>
                            ))}

                            <div className="pt-4 mt-4 border-t border-border">
                                <Link to="/predict">
                                    <Button className="w-full gradient-accent text-white font-semibold border-0 rounded-xl shadow-accent-glow gap-2">
                                        <Zap className="w-4 h-4" /> Try It Now
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </aside>

                    {/* Main content */}
                    <main className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="mb-12 animate-slide-up">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary mb-4">
                                <BookOpen className="w-4 h-4 text-indigo-500" />
                                <span className="text-sm font-medium text-muted-foreground">Project Documentation</span>
                            </div>
                            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                                House Price Prediction
                                <br />
                                <span className="text-gradient-primary">Using Machine Learning</span>
                            </h1>
                            <p className="text-muted-foreground text-lg mt-4 max-w-2xl">
                                A full-stack AI system that predicts Indian house prices using Random Forest regression
                                and forecasts future market trends using ARIMA time-series analysis.
                            </p>
                        </div>

                        {/* ── OVERVIEW ── */}
                        <section id="overview" className="mb-16 scroll-mt-28 animate-slide-up">
                            <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-indigo-500" />
                                </div>
                                Project Overview
                            </h2>

                            <div className="bg-card rounded-2xl border border-border shadow-card p-8">
                                <div className="space-y-4 text-foreground/80 leading-relaxed">
                                    <p>
                                        This project is a <strong>House Price Prediction and Forecasting System</strong> built as a final year project.
                                        It uses machine learning models to predict the market value of residential properties across India
                                        based on 22+ property features.
                                    </p>
                                    <p>
                                        The system consists of two main models:
                                    </p>
                                    <ul className="space-y-2 ml-4">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
                                            <span><strong>Random Forest Regressor</strong> — Predicts the current market price of a property based on its features like location, size, BHK, amenities, etc.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
                                            <span><strong>ARIMA Forecast Model</strong> — Predicts future price trends using time-series analysis with growth decay modeling.</span>
                                        </li>
                                    </ul>
                                    <p>
                                        The application features a modern web interface built with React and Tailwind CSS, a FastAPI backend
                                        that serves ML predictions via REST API, and interactive charts for forecast visualization.
                                    </p>
                                </div>

                                {/* Quick stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                    {[
                                        { label: "R² Score", value: "0.98", icon: BarChart2 },
                                        { label: "Training Records", value: "100K+", icon: Database },
                                        { label: "Features", value: "22", icon: Layers },
                                        { label: "API Latency", value: "<0.5s", icon: Zap },
                                    ].map((s) => (
                                        <div key={s.label} className="bg-secondary rounded-xl p-4 text-center">
                                            <s.icon className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
                                            <div className="font-display font-bold text-xl text-foreground">{s.value}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* ── ARCHITECTURE ── */}
                        <section id="architecture" className="mb-16 scroll-mt-28 animate-slide-up">
                            <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                    <Layers className="w-5 h-5 text-violet-500" />
                                </div>
                                System Architecture
                            </h2>

                            <div className="bg-card rounded-2xl border border-border shadow-card p-8">
                                <p className="text-foreground/80 mb-6">
                                    The system follows a <strong>client-server architecture</strong> with clear separation between the presentation layer,
                                    API layer, and ML inference layer.
                                </p>

                                {/* Architecture flow */}
                                <div className="grid md:grid-cols-5 gap-3 mb-8">
                                    {[
                                        { step: "User Interface", sub: "React + Tailwind", color: "bg-indigo-500" },
                                        { step: "API Gateway", sub: "FastAPI + CORS", color: "bg-violet-500" },
                                        { step: "Preprocessing", sub: "Pandas Pipeline", color: "bg-purple-500" },
                                        { step: "ML Inference", sub: "Random Forest", color: "bg-amber-500" },
                                        { step: "Response", sub: "JSON Prediction", color: "bg-emerald-500" },
                                    ].map((item, i) => (
                                        <div key={item.step} className="flex items-center gap-2">
                                            <div className="flex-1 text-center p-4 bg-secondary rounded-xl border border-border">
                                                <div className={`w-3 h-3 rounded-full ${item.color} mx-auto mb-2`} />
                                                <div className="font-semibold text-sm text-foreground">{item.step}</div>
                                                <div className="text-xs text-muted-foreground mt-0.5">{item.sub}</div>
                                            </div>
                                            {i < 4 && <ArrowRight className="w-4 h-4 text-muted-foreground/40 hidden md:block flex-shrink-0" />}
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 text-foreground/80">
                                    <p><strong>Data Flow:</strong></p>
                                    <ol className="list-decimal ml-6 space-y-1.5 text-sm">
                                        <li>User fills in property details on the React frontend (3-step form)</li>
                                        <li>Form data is sent as a JSON POST request to the FastAPI backend</li>
                                        <li>Backend converts string inputs to numeric types and creates a Pandas DataFrame</li>
                                        <li>The sklearn pipeline handles log transforms, imputation, encoding, and scaling</li>
                                        <li>Preprocessed data is fed to the trained Random Forest model for price prediction</li>
                                        <li>ARIMA model generates a future trend forecast independently</li>
                                        <li>Both predictions are returned as JSON to the frontend for display</li>
                                    </ol>
                                </div>
                            </div>
                        </section>

                        {/* ── ML MODELS ── */}
                        <section id="models" className="mb-16 scroll-mt-28 animate-slide-up">
                            <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-amber-500" />
                                </div>
                                Machine Learning Models
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Random Forest */}
                                <div className="bg-card rounded-2xl border border-border shadow-card p-7 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                            <Brain className="w-5 h-5 text-indigo-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-display font-bold text-lg text-foreground">Random Forest Regressor</h3>
                                            <p className="text-xs text-muted-foreground">Price Prediction Model</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3 text-sm text-foreground/80">
                                        <p>Ensemble learning method that constructs multiple decision trees during training and outputs the average prediction.</p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between p-2 bg-secondary rounded-lg">
                                                <span className="text-muted-foreground">Algorithm</span>
                                                <span className="font-semibold">Random Forest</span>
                                            </div>
                                            <div className="flex justify-between p-2 bg-secondary rounded-lg">
                                                <span className="text-muted-foreground">R² Score (Test)</span>
                                                <span className="font-semibold text-emerald-600">0.94</span>
                                            </div>
                                            <div className="flex justify-between p-2 bg-secondary rounded-lg">
                                                <span className="text-muted-foreground">R² Score (Train)</span>
                                                <span className="font-semibold text-emerald-600">0.97</span>
                                            </div>
                                            <div className="flex justify-between p-2 bg-secondary rounded-lg">
                                                <span className="text-muted-foreground">Pipeline</span>
                                                <span className="font-semibold">Sklearn Pipeline</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ARIMA */}
                                <div className="bg-card rounded-2xl border border-border shadow-card p-7 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-display font-bold text-lg text-foreground">ARIMA Forecast</h3>
                                            <p className="text-xs text-muted-foreground">Time-Series Model</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3 text-sm text-foreground/80">
                                        <p>Auto-Regressive Integrated Moving Average model for time-series forecasting with growth decay over long horizons.</p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between p-2 bg-secondary rounded-lg">
                                                <span className="text-muted-foreground">Algorithm</span>
                                                <span className="font-semibold">ARIMA</span>
                                            </div>
                                            <div className="flex justify-between p-2 bg-secondary rounded-lg">
                                                <span className="text-muted-foreground">Forecast Range</span>
                                                <span className="font-semibold">6mo — 10 years</span>
                                            </div>
                                            <div className="flex justify-between p-2 bg-secondary rounded-lg">
                                                <span className="text-muted-foreground">Decay Modeling</span>
                                                <span className="font-semibold text-emerald-600">Yes</span>
                                            </div>
                                            <div className="flex justify-between p-2 bg-secondary rounded-lg">
                                                <span className="text-muted-foreground">Confidence Bands</span>
                                                <span className="font-semibold text-emerald-600">Yes</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ── TECH STACK ── */}
                        <section id="tech-stack" className="mb-16 scroll-mt-28 animate-slide-up">
                            <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center">
                                    <Code2 className="w-5 h-5 text-rose-500" />
                                </div>
                                Technology Stack
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                {techStack.map((t) => (
                                    <div key={t.category} className="bg-card rounded-2xl border border-border shadow-card p-6 relative overflow-hidden group card-hover">
                                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${t.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${t.color} flex items-center justify-center`}>
                                                <t.icon className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="font-display font-bold text-lg text-foreground">{t.category}</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {t.items.map((item) => (
                                                <span key={item} className="px-3 py-1.5 bg-secondary rounded-lg text-sm font-medium text-foreground/80">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* ── HOW TO USE ── */}
                        <section id="how-to-use" className="mb-16 scroll-mt-28 animate-slide-up">
                            <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center">
                                    <Target className="w-5 h-5 text-sky-500" />
                                </div>
                                How to Use
                            </h2>

                            <div className="space-y-4">
                                {howToSteps.map((step, i) => (
                                    <div key={step.num} className="bg-card rounded-2xl border border-border shadow-card p-6 flex items-start gap-5 group card-hover">
                                        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <step.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-xs font-bold text-indigo-500 tracking-wider">{step.num}</span>
                                                <h3 className="font-display font-bold text-lg text-foreground">{step.title}</h3>
                                            </div>
                                            <p className="text-sm text-foreground/70 leading-relaxed">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* ── DATASET ── */}
                        <section id="dataset" className="mb-16 scroll-mt-28 animate-slide-up">
                            <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                    <Database className="w-5 h-5 text-emerald-500" />
                                </div>
                                Dataset Information
                            </h2>

                            <div className="bg-card rounded-2xl border border-border shadow-card p-8">
                                <div className="grid md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-secondary rounded-xl p-5 text-center">
                                        <div className="font-display font-bold text-3xl text-gradient-primary">102,847</div>
                                        <div className="text-sm text-muted-foreground mt-1">Total Records</div>
                                    </div>
                                    <div className="bg-secondary rounded-xl p-5 text-center">
                                        <div className="font-display font-bold text-3xl text-gradient-accent">22</div>
                                        <div className="text-sm text-muted-foreground mt-1">Features</div>
                                    </div>
                                    <div className="bg-secondary rounded-xl p-5 text-center">
                                        <div className="font-display font-bold text-3xl text-emerald-600">80/20</div>
                                        <div className="text-sm text-muted-foreground mt-1">Train/Test Split</div>
                                    </div>
                                </div>

                                <h3 className="font-display font-bold text-lg text-foreground mb-4">Feature Columns</h3>
                                <div className="flex flex-wrap gap-2">
                                    {datasetFeatures.map((f, i) => (
                                        <span
                                            key={f}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${i === datasetFeatures.length - 1
                                                ? "gradient-accent text-white"
                                                : "bg-secondary text-foreground/80"
                                                }`}
                                        >
                                            {f}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-6 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                                    <p className="text-sm text-foreground/70">
                                        <strong className="text-foreground">Source:</strong> Indian Housing Prices dataset from Kaggle,
                                        containing real estate listings across 10+ Indian states with detailed property attributes.
                                        The target variable <strong>Price in Lakhs</strong> is highlighted above.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* CTA */}
                        <div className="bg-card rounded-3xl border border-border shadow-card p-10 text-center animated-border">
                            <Sparkles className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
                            <h2 className="font-display text-3xl font-bold text-foreground mb-3">
                                Ready to Try It?
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                Enter your property details and get an instant prediction.
                            </p>
                            <Link to="/predict">
                                <Button className="gradient-accent text-white font-semibold rounded-full px-10 py-6 text-base shadow-accent-glow gap-2">
                                    Start Predicting <ArrowRight className="w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
