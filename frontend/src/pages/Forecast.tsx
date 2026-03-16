import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useState, useMemo } from "react";
import localitiesData from "@/data/real_localities.json";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Calendar, Zap, BarChart2, Info } from "lucide-react";

const formatPrice = (v: number) => {
  if (v >= 100) return `₹${(v / 100).toFixed(2)} Cr`;
  return `₹${v.toFixed(2)} L`;
};

const HORIZONS = [
  { label: "6 months", months: 6 },
  { label: "1 year", months: 12 },
  { label: "2 years", months: 24 },
  { label: "5 years", months: 60 },
  { label: "10 years", months: 120 },
];

export default function Forecast() {
  const location = useLocation();
  const incomingData = location.state?.predictionData;
  const [horizon, setHorizon] = useState(12);

  const data = useMemo(() => {
    // Determine the base prices from either format (direct predict response OR history array response)
    const currentPriceBase = incomingData?.output?.real_estate_prediction
      ?? incomingData?.real_estate_prediction
      ?? 0;

    const forecastTarget = incomingData?.output?.hybrid_forecast_prediction
      ?? incomingData?.hybrid_forecast_prediction
      ?? 0;

    if (currentPriceBase === 0 || forecastTarget === 0) {
      return []; // Return empty data to safely handle missing values
    }

    const rawMonthlyRate = Math.pow(forecastTarget / currentPriceBase, 1 / 12) - 1;

    const result: any[] = [];
    const now = new Date();
    const step = horizon > 24 ? 6 : 1;
    let rollingPrice = currentPriceBase;

    for (let i = -6; i <= horizon; i++) {
      if (i <= 0) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const histValue = currentPriceBase * Math.pow(1 + rawMonthlyRate, i);
        result.push({
          month: d.toLocaleString("default", { month: horizon > 24 ? "numeric" : "short", year: "2-digit" }),
          fullDate: d.toLocaleString("default", { month: "long", year: "numeric" }),
          price: histValue,
          forecast: false,
        });
        continue;
      }

      if (horizon > 24 && i % step !== 0 && i !== horizon) continue;

      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const yearOfForecast = Math.ceil(i / 12);
      const decayFactor = Math.max(0.3, 1 - (yearOfForecast - 1) * 0.1);
      const adjustedRate = rawMonthlyRate * decayFactor;

      rollingPrice = rollingPrice * Math.pow(1 + adjustedRate, step);

      result.push({
        month: d.toLocaleString("default", { month: horizon > 24 ? "numeric" : "short", year: "2-digit" }),
        fullDate: d.toLocaleString("default", { month: "long", year: "numeric" }),
        price: rollingPrice,
        forecast: true,
        upper: rollingPrice * (1 + i * 0.0035),
        lower: rollingPrice * (1 - i * 0.0035),
      });
    }
    return result;
  }, [incomingData, horizon]);

  const lastActual = data.filter((d) => !d.forecast).at(-1);
  const lastForecast = data.at(-1);
  const growth = lastActual && lastForecast
    ? (((lastForecast.price - lastActual.price) / lastActual.price) * 100).toFixed(1)
    : "0";

  const numericGrowth = parseFloat(growth);
  const isPositive = numericGrowth >= 0;

  // Extract inputs for the details panel
  const inputs = incomingData?.input || {};

  let localityName = inputs.Locality || "-";
  if (inputs.City && localitiesData) {
    const cityLocalities = (localitiesData as Record<string, { name: string, value: string }[]>)[inputs.City];
    if (cityLocalities) {
      const matched = cityLocalities.find(l => l.value === inputs.Locality);
      if (matched) localityName = matched.name;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 animate-slide-up">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-3 ${isPositive
              ? "bg-emerald-500/10 border-emerald-500/20"
              : "bg-rose-500/10 border-rose-500/20"
              }`}>
              {isPositive
                ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                : <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              }
              <span className={`text-sm font-medium ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                ARIMA Time-Series
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Market <span className="text-gradient-primary">Forecast</span>
            </h1>
            <p className="text-muted-foreground mt-1">Intelligent valuation trajectory with growth decay modeling</p>
          </div>

          {/* Horizon picker */}
          <div className="flex items-center gap-1 bg-secondary rounded-full p-1 overflow-x-auto">
            {HORIZONS.map((h) => (
              <button
                key={h.months}
                onClick={() => setHorizon(h.months)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${horizon === h.months
                  ? "gradient-primary text-white shadow-md"
                  : "text-muted-foreground hover:bg-white hover:shadow-sm"
                  }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up delay-100">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
            <p className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
              <Calendar className="w-4 h-4 text-indigo-500" /> Current Value
            </p>
            <h3 className="text-2xl font-bold mt-2 text-foreground">{formatPrice(lastActual?.price ?? 0)}</h3>
          </div>
          <div className={`${isPositive ? "bg-emerald-500/5 border-emerald-500/15" : "bg-rose-500/5 border-rose-500/15"} border rounded-2xl p-6 shadow-card`}>
            <p className={`text-sm font-semibold flex items-center gap-2 ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />} {horizon > 12 ? `${Math.round(horizon / 12)}yr` : `${horizon}m`} Target
            </p>
            <h3 className={`text-2xl font-bold mt-2 ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>{formatPrice(lastForecast?.price ?? 0)}</h3>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-6 shadow-card">
            <p className="text-sm text-amber-600 font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4" /> {isPositive ? "Total Growth" : "Total Decline"}
            </p>
            <h3 className="text-2xl font-bold mt-2 text-amber-600">{growth}%</h3>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
            <p className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
              <BarChart2 className="w-4 h-4 text-indigo-500" /> Confidence
            </p>
            <h3 className="text-2xl font-bold mt-2 text-foreground">{horizon > 24 ? "Moderate" : "High"}</h3>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-card rounded-3xl border border-border shadow-card p-6 md:p-8 animate-slide-up delay-200">
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>Shaded area represents confidence bands. Dashed line marks current date.</span>
          </div>
          <ResponsiveContainer width="100%" height={420}>
            <AreaChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "hsl(245 80% 60%)" : "hsl(348 83% 57%)"} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={isPositive ? "hsl(245 80% 60%)" : "hsl(348 83% 57%)"} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "hsl(245 58% 51%)" : "hsl(348 83% 47%)"} stopOpacity={0.08} />
                  <stop offset="95%" stopColor={isPositive ? "hsl(245 58% 51%)" : "hsl(348 83% 47%)"} stopOpacity={0.01} />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(225 15% 90%)" opacity={0.5} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "hsl(225 20% 45%)", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                tickFormatter={(v) => `₹${v.toFixed(0)}L`}
                tick={{ fontSize: 12, fill: "hsl(225 20% 45%)", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                dx={-10}
              />
              <Tooltip
                labelFormatter={(value) => data.find(d => d.month === value)?.fullDate}
                formatter={(value: number, name: string) => {
                  if (name === "price") return [formatPrice(value), "Predicted Value"];
                  if (name === "upper") return [formatPrice(value), "High Estimate"];
                  if (name === "lower") return [formatPrice(value), "Low Estimate"];
                  return [formatPrice(value), name];
                }}
                contentStyle={{
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255, 255, 255, 0.85)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)",
                  fontFamily: "Inter, sans-serif",
                  padding: "12px 16px"
                }}
                itemStyle={{
                  fontWeight: 600,
                  color: "hsl(220 20% 20%)"
                }}
              />
              <ReferenceLine
                x={lastActual?.month}
                stroke="hsl(25 95% 53%)"
                strokeDasharray="4 4"
                label={{ position: "top", value: "Today", fill: "hsl(25 95% 53%)", fontSize: 12, fontWeight: 700, offset: 10 }}
              />
              <Area
                type="monotoneX"
                dataKey="upper"
                stroke="transparent"
                fill="url(#colorBand)"
                isAnimationActive={true}
              />
              <Area
                type="monotoneX"
                dataKey="lower"
                stroke="transparent"
                fill="url(#colorBand)"
                isAnimationActive={true}
              />
              <Area
                type="monotoneX"
                dataKey="price"
                stroke={isPositive ? "hsl(245 75% 55%)" : "hsl(348 83% 57%)"}
                strokeWidth={4}
                fill="url(#colorPrice)"
                dot={false}
                activeDot={{ r: 6, fill: isPositive ? "hsl(245 75% 55%)" : "hsl(348 83% 57%)", stroke: "#fff", strokeWidth: 3, filter: "url(#glow)" }}
                style={{ filter: "url(#glow)" }}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Property Details Panel */}
        {Object.keys(inputs).length > 0 && (
          <div className="mt-6 bg-card rounded-3xl border border-border shadow-card p-6 md:p-8 animate-slide-up delay-300">
            <h2 className="font-display font-bold text-xl text-foreground mb-6 flex items-center gap-2">
              Property Configuration
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <p className="font-medium">{localityName}, {inputs.City || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Configuration</p>
                <p className="font-medium">{inputs.BHK || "-"} BHK {inputs.Property_Type || ""}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Area</p>
                <p className="font-medium">{inputs.Size_in_SqFt || "-"} Sq.Ft</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Age</p>
                <p className="font-medium">{inputs.Age_of_Property || "-"} Years ({inputs.Year_Built || "-"})</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Furnishing</p>
                <p className="font-medium">{inputs.Furnished_Status || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Floor</p>
                <p className="font-medium">{inputs.Floor_No || "-"} of {inputs.Total_Floors || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Facing</p>
                <p className="font-medium">{inputs.Facing || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Amenities Context</p>
                <p className="font-medium text-amber-600 truncate">{inputs.Amenities || "Standard"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}