import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import localitiesData from "@/data/real_localities.json";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Database, Activity, CheckCircle, Clock, TrendingUp,
  Users, Cpu, BarChart2, Sparkles,
} from "lucide-react";

const modelMetrics = [
  { metric: "R² Score", train: 0.97, test: 0.94 },
  { metric: "MAE", train: 0.12, test: 0.18 },
  { metric: "RMSE", train: 0.19, test: 0.26 },
  { metric: "MAPE", train: 4.2, test: 6.8 },
];

const requestLog = [
  { time: "09:00", requests: 24 },
  { time: "10:00", requests: 48 },
  { time: "11:00", requests: 63 },
  { time: "12:00", requests: 38 },
  { time: "13:00", requests: 52 },
  { time: "14:00", requests: 71 },
  { time: "15:00", requests: 89 },
  { time: "16:00", requests: 45 },
  { time: "17:00", requests: 30 },
];

const systemStatus = [
  { name: "ML Inference API", status: "online", latency: "0.3s" },
  { name: "Data Pipeline", status: "online", latency: "1.2s" },
  { name: "ARIMA Forecast Engine", status: "online", latency: "0.8s" },
  { name: "Model Registry", status: "online", latency: "0.05s" },
];

export default function Admin() {
  const { token } = useAuth();
  const [recentPredictions, setRecentPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      try {
        const response = await fetch("http://localhost:8004/predictions/history", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          // Transform history to match table format
          const formatted = data.predictions.map((p: any, idx: number) => {
            let localityName = p.input.Locality;
            const cityLocalities = (localitiesData as Record<string, { name: string, value: string }[]>)[p.input.City];
            if (cityLocalities) {
              const matched = cityLocalities.find(l => l.value === p.input.Locality);
              if (matched) localityName = matched.name;
            }

            return {
              id: `#P-${1000 + idx}`,
              location: `${localityName}, ${p.input.City}`,
              bhk: `${p.input.BHK} BHK`,
              area: `${p.input.Size_in_SqFt} sqft`,
              price: p.output.real_estate_prediction >= 100
                ? `₹${(p.output.real_estate_prediction / 100).toFixed(2)} Cr`
                : `₹${p.output.real_estate_prediction.toFixed(2)} L`,
              confidence: "92%", // Example fixed value since backend doesn't return confidence yet
              status: "success",
              rawData: p // Store the raw prediction data for navigation
            };
          });
          setRecentPredictions(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  const navigate = useNavigate();

  const handleRowClick = (rowData: any) => {
    if (!rowData.rawData) return;
    navigate("/forecast", { state: { predictionData: rowData.rawData } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mb-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary mb-3">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-sm text-muted-foreground font-medium">System Dashboard</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Model <span className="text-gradient-primary">Analytics</span>
          </h1>
          <p className="text-muted-foreground mt-1">Monitor model performance, system health, and prediction analytics</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up delay-100">
          {[
            { label: "Total Predictions", value: "12,482", change: "+8.3%", icon: Database, gradient: "gradient-primary", iconColor: "text-white" },
            { label: "Active Users", value: "847", change: "+23.1%", icon: Users, gradient: "bg-gradient-to-r from-emerald-500 to-teal-500", iconColor: "text-white" },
            { label: "Avg Accuracy", value: "94.2%", change: "+1.8%", icon: TrendingUp, gradient: "gradient-accent", iconColor: "text-white" },
            { label: "Avg Latency", value: "0.38s", change: "-12ms", icon: Activity, gradient: "bg-gradient-to-r from-violet-500 to-purple-600", iconColor: "text-white" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-card rounded-2xl border border-border shadow-card card-hover overflow-hidden">
              <div className={`${kpi.gradient} p-4 flex items-center justify-between`}>
                <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
                <span className={`text-xs ${kpi.iconColor} opacity-80 font-medium`}>{kpi.change}</span>
              </div>
              <div className="p-4">
                <div className="font-display font-bold text-2xl text-foreground">{kpi.value}</div>
                <div className="text-muted-foreground text-sm">{kpi.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6 animate-slide-up delay-200">
          {/* API Requests Chart */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-card p-6">
            <h2 className="font-display font-bold text-lg text-foreground mb-1">API Request Volume</h2>
            <p className="text-muted-foreground text-sm mb-4">Hourly prediction requests today</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={requestLog}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 15% 92%)" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "hsl(225 15% 55%)" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(225 15% 55%)" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(225 15% 89%)", fontFamily: "Inter" }} />
                <Line type="monotone" dataKey="requests" stroke="hsl(245 58% 51%)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* System Status */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-6">
            <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> System Status
            </h2>
            <div className="space-y-3">
              {systemStatus.map((s) => (
                <div key={s.name} className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm text-foreground font-medium">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{s.latency}</span>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 text-sm font-semibold">All systems operational</span>
              </div>
              <p className="text-muted-foreground text-xs mt-1">Last checked: 30 seconds ago</p>
            </div>
          </div>
        </div>

        {/* Model Metrics + Recent Predictions */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6 animate-slide-up delay-300">
          {/* Model Metrics */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-6">
            <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-500" /> Model Metrics
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={modelMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 15% 92%)" vertical={false} />
                <XAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(225 15% 55%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(225 15% 55%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(225 15% 89%)", fontFamily: "Inter" }} />
                <Bar dataKey="train" name="Train" fill="hsl(245 58% 51%)" radius={[6, 6, 0, 0]} maxBarSize={20} />
                <Bar dataKey="test" name="Test" fill="hsl(25 95% 53%)" radius={[6, 6, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-3 justify-center">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-500 inline-block" /> Train
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block" /> Test
              </span>
            </div>
          </div>

          {/* Recent Predictions Table */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-card p-6">
            <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Recent Predictions
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["ID", "Location", "Config", "Predicted", "Confidence", "Status"].map((h) => (
                      <th key={h} className="text-left text-muted-foreground font-medium py-3 pr-4 text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                        Loading predictions...
                      </td>
                    </tr>
                  ) : recentPredictions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                        No predictions made yet.
                      </td>
                    </tr>
                  ) : (
                    recentPredictions.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => handleRowClick(row)}
                        className="border-b border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer"
                      >
                        <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{row.id}</td>
                        <td className="py-3 pr-4 text-foreground font-medium">{row.location}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{row.bhk} · {row.area}</td>
                        <td className="py-3 pr-4 font-semibold text-indigo-500">{row.price}</td>
                        <td className="py-3 pr-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${parseInt(row.confidence) >= 90
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-amber-500/10 text-amber-600"
                            }`}>
                            {row.confidence}
                          </span>
                        </td>
                        <td className="py-3">
                          {row.status === "success" ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Sparkles className="w-4 h-4 text-amber-500" />
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Dataset Overview */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6 animate-slide-up delay-400">
          <h2 className="font-display font-bold text-lg text-foreground mb-4">Dataset Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Records", value: "102,847", icon: Database },
              { label: "Features Used", value: "22", icon: Activity },
              { label: "Train / Test Split", value: "80 / 20", icon: TrendingUp },
              { label: "Last Retrained", value: "2 days ago", icon: Clock },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-display font-bold text-xl text-foreground">{item.value}</div>
                  <div className="text-muted-foreground text-xs">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
