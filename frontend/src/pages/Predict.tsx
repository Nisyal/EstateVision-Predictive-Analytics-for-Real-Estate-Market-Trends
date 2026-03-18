import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Brain, MapPin, Home, Bed, Calendar, Sofa, Zap, CheckCircle,
  Shield, Bus, GraduationCap, HeartPulse, Car, User, Clock,
  IndianRupee, ArrowRight, ArrowLeft, Sparkles, AlertCircle, Percent,
  TrendingUp, TrendingDown, Factory
} from "lucide-react";
import localitiesData from "@/data/real_localities.json";
import subLocalitiesData from "@/data/sub_localities.json";

const states = [
  "Karnataka", "Maharashtra", "Tamil Nadu", "Delhi", "Telangana",
  "Gujarat", "Rajasthan", "Uttar Pradesh", "West Bengal", "Kerala",
];

const cities: Record<string, string[]> = {
  Karnataka: ["Bangalore", "Mysore", "Hubli", "Mangalore"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Thane"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
  Delhi: ["New Delhi", "Dwarka", "Rohini", "Saket"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  Rajasthan: ["Jaipur", "Udaipur", "Jodhpur", "Kota"],
  "Uttar Pradesh": ["Noida", "Lucknow", "Ghaziabad", "Agra"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri"],
  Kerala: ["Kochi", "Trivandrum", "Calicut", "Thrissur"],
};

const propertyTypes = ["Apartment", "Villa", "Row House", "Independent House", "Studio", "Penthouse"];
const furnishingOptions = ["Fully Furnished", "Semi Furnished", "Unfurnished"];
const facingOptions = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];
const ownerTypes = ["First Owner", "Second Owner", "Third Owner", "Resale"];
const availabilityOptionsDefault = ["Ready to Move", "Under Construction"];
const availabilityOptionsCurrentYear = ["Ready to Move", "Renovated"];
const currentYear = new Date().getFullYear();
const amenitiesList = [
  "Swimming Pool", "Gym", "Power Backup",
  "Elevator", "Garden", "Jogging Track", "CCTV", "Children Park",
  "Tennis Court", "Basketball Court", "Badminton Court"
];
const accessibilityOptions = ["High", "Medium", "Low"];

const localities: Record<string, { name: string, value: string }[]> = localitiesData;
const subLocalities: Record<string, { name: string, multiplier: number }[]> = subLocalitiesData;

export default function Predict() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [form, setForm] = useState({
    State: "",
    City: "",
    Locality: "",
    Sub_Locality: "",
    Property_Type: "",
    BHK: "2",
    Size_in_SqFt: "1200",
    Price_per_SqFt: "5000",
    Year_Built: "2020",
    Furnished_Status: "",
    Floor_No: "3",
    Total_Floors: "10",
    Age_of_Property: "3",
    Nearby_Schools: "2",
    Nearby_Hospitals: "1",
    Public_Transport_Accessibility: "",
    Parking_Space: "Yes",
    Security: "Yes",
    Amenities: [] as string[],
    Facing: "",
    Owner_Type: "",
    Availability_Status: "",
    interest_rates: "Normal",
    economic_outlook: "Stable",
    housing_supply: "Balanced",
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const toggleAmenity = (a: string) => {
    setForm((prev) => ({
      ...prev,
      Amenities: prev.Amenities.includes(a)
        ? prev.Amenities.filter((x) => x !== a)
        : [...prev.Amenities, a],
    }));
  };

  const handlePredict = async () => {
    const requiredFields = [
      { field: "State", label: "State" },
      { field: "City", label: "City" },
      { field: "Locality", label: "Locality" },
      { field: "Property_Type", label: "Property Type" },
      { field: "Facing", label: "Facing" },
      { field: "Furnished_Status", label: "Furnished Status" },
      { field: "Owner_Type", label: "Owner Type" },
      { field: "Availability_Status", label: "Availability Status" },
      { field: "Public_Transport_Accessibility", label: "Public Transport" },
    ];

    const emptyFields = requiredFields.filter(
      (item) => !form[item.field as keyof typeof form] || form[item.field as keyof typeof form] === ""
    );

    if (emptyFields.length > 0) {
      alert("Please fill all required fields: " + emptyFields.map(f => f.label).join(", "));
      return;
    }

    setLoading(true);

    try {
      const payload = {
        State: String(form.State),
        City: String(form.City),
        Locality: String(form.Locality),
        Sub_Locality: String(form.Sub_Locality),
        Property_Type: String(form.Property_Type),
        BHK: String(form.BHK),
        Size_in_SqFt: String(form.Size_in_SqFt),
        Price_per_SqFt: String(form.Price_per_SqFt),
        Year_Built: String(form.Year_Built),
        Furnished_Status: String(form.Furnished_Status),
        Floor_No: String(form.Floor_No),
        Total_Floors: String(form.Total_Floors),
        Age_of_Property: String(form.Age_of_Property),
        Nearby_Schools: String(form.Nearby_Schools),
        Nearby_Hospitals: String(form.Nearby_Hospitals),
        Public_Transport_Accessibility: String(form.Public_Transport_Accessibility),
        Parking_Space: String(form.Parking_Space),
        Security: String(form.Security),
        Amenities: Array.isArray(form.Amenities) ? form.Amenities.join(", ") : String(form.Amenities),
        Facing: String(form.Facing),
        Owner_Type: String(form.Owner_Type),
        Availability_Status: String(form.Availability_Status),
        interest_rates: String(form.interest_rates),
        economic_outlook: String(form.economic_outlook),
        housing_supply: String(form.housing_supply),
      };

      const API_URL = 'http://localhost:8004/predict';

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000),
      });

      if (response.status === 403) {
        const errData = await response.json();
        alert(errData.detail || "Prediction limit reached! Please upgrade your plan.");
        navigate("/pricing");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Validation Error Details:", errorData.detail);
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      navigate("/results", { state: { predictionData: data } });
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("Something went wrong. Check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = [
    { label: "Location & Type", icon: MapPin },
    { label: "Size & Layout", icon: Home },
    { label: "Features & Extras", icon: Sofa },
    { label: "Market Trends", icon: TrendingUp },
  ];

  const inputClass = "h-12 rounded-xl border-border bg-background focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all";
  const labelClass = "text-sm font-medium text-foreground flex items-center gap-2";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary mb-4">
            <Brain className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-muted-foreground">AI Prediction Engine</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground">
            Property <span className="text-gradient-primary">Details</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Fill in your property information to get an intelligent price prediction</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-10 animate-slide-up delay-100">
          {stepLabels.map((s, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div key={stepNum} className="flex items-center gap-3">
                <button
                  onClick={() => setStep(stepNum)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${isActive
                    ? "gradient-primary text-white shadow-primary-glow"
                    : isDone
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                >
                  {isDone ? <CheckCircle className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{stepNum}</span>
                </button>
                {i < 2 && <div className={`w-8 h-0.5 rounded-full ${isDone ? "bg-emerald-500" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>

        {/* Form card */}
        <div className="bg-card rounded-3xl border border-border shadow-card p-8 animate-slide-up delay-200">
          {/* Step 1: Location & Type */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                </div>
                Location & Property Type
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className={labelClass}>State *</Label>
                  <Select value={form.State} onValueChange={(v) => setForm({ ...form, State: v, City: "" })}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Select state..." /></SelectTrigger>
                    <SelectContent>{states.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>City *</Label>
                  <Select value={form.City} onValueChange={(v) => setForm({ ...form, City: v, Locality: "" })} disabled={!form.State}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Select city..." /></SelectTrigger>
                    <SelectContent>{(cities[form.State] || []).map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Locality *</Label>
                  <Select value={form.Locality} onValueChange={(v) => setForm({ ...form, Locality: v, Sub_Locality: "" })} disabled={!form.City}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Select locality..." /></SelectTrigger>
                    <SelectContent>{(localities[form.City] || []).map((l) => (<SelectItem key={l.value} value={l.value}>{l.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Sub Locality</Label>
                  <Select value={form.Sub_Locality} onValueChange={(v) => setForm({ ...form, Sub_Locality: v })} disabled={!form.Locality}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Select specific area..." /></SelectTrigger>
                    <SelectContent>{(subLocalities[`${form.City}_${form.Locality}`] || []).map((sl) => (<SelectItem key={sl.name} value={sl.name}>{sl.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Property Type *</Label>
                  <Select value={form.Property_Type} onValueChange={(v) => setForm({ ...form, Property_Type: v })}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Select type..." /></SelectTrigger>
                    <SelectContent>{propertyTypes.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Facing *</Label>
                  <Select value={form.Facing} onValueChange={(v) => setForm({ ...form, Facing: v })}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Select facing..." /></SelectTrigger>
                    <SelectContent>{facingOptions.map((f) => (<SelectItem key={f} value={f}>{f}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Size & Layout */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Home className="w-4 h-4 text-amber-500" />
                </div>
                Size & Layout
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className={labelClass}><Bed className="w-4 h-4 text-indigo-500" /> BHK</Label>
                  <Select value={form.BHK} onValueChange={(v) => setForm({ ...form, BHK: v })}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>{["1", "2", "3", "4", "5", "6+"].map((b) => (<SelectItem key={b} value={b}>{b} BHK</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Size (sq.ft)</Label>
                  <Input type="number" value={form.Size_in_SqFt} onChange={(e) => setForm({ ...form, Size_in_SqFt: e.target.value })} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}><IndianRupee className="w-4 h-4 text-indigo-500" /> Price per SqFt</Label>
                  <Input type="number" value={form.Price_per_SqFt} onChange={(e) => setForm({ ...form, Price_per_SqFt: e.target.value })} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}><Calendar className="w-4 h-4 text-indigo-500" /> Year Built</Label>
                  <Input type="number" min="1900" max={currentYear} value={form.Year_Built} onChange={(e) => {
                    const val = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      Year_Built: val,
                      // Reset availability when year changes so stale values don't persist
                      Availability_Status: "",
                    }));
                  }} className={inputClass} />

                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Age of Property (years)</Label>
                  <Input type="number" value={form.Age_of_Property} onChange={(e) => setForm({ ...form, Age_of_Property: e.target.value })} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Floor Number</Label>
                  <Input type="number" value={form.Floor_No} onChange={(e) => setForm({ ...form, Floor_No: e.target.value })} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Total Floors</Label>
                  <Input type="number" value={form.Total_Floors} onChange={(e) => setForm({ ...form, Total_Floors: e.target.value })} className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Features & Extras */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Sofa className="w-4 h-4 text-emerald-500" />
                </div>
                Features & Extras
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className={labelClass}><Sofa className="w-4 h-4 text-indigo-500" /> Furnished Status *</Label>
                  <Select value={form.Furnished_Status} onValueChange={(v) => setForm({ ...form, Furnished_Status: v })}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Select status..." /></SelectTrigger>
                    <SelectContent>{furnishingOptions.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}><User className="w-4 h-4 text-indigo-500" /> Owner Type *</Label>
                  <Select value={form.Owner_Type} onValueChange={(v) => setForm({ ...form, Owner_Type: v })}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Select owner type..." /></SelectTrigger>
                    <SelectContent>{ownerTypes.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}><Clock className="w-4 h-4 text-indigo-500" /> Availability *</Label>
                  <Select value={form.Availability_Status} onValueChange={(v) => setForm({ ...form, Availability_Status: v })}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Select availability..." /></SelectTrigger>
                    <SelectContent>
                      {(form.Year_Built === String(currentYear)
                        ? availabilityOptionsCurrentYear
                        : availabilityOptionsDefault
                      ).map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}
                    </SelectContent>
                  </Select>

                </div>
                <div className="space-y-2">
                  <Label className={labelClass}><Bus className="w-4 h-4 text-indigo-500" /> Public Transport *</Label>
                  <Select value={form.Public_Transport_Accessibility} onValueChange={(v) => setForm({ ...form, Public_Transport_Accessibility: v })}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Select accessibility..." /></SelectTrigger>
                    <SelectContent>{accessibilityOptions.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}><GraduationCap className="w-4 h-4 text-indigo-500" /> Nearby Schools</Label>
                  <Input type="number" value={form.Nearby_Schools} onChange={(e) => setForm({ ...form, Nearby_Schools: e.target.value })} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}><HeartPulse className="w-4 h-4 text-indigo-500" /> Nearby Hospitals</Label>
                  <Input type="number" value={form.Nearby_Hospitals} onChange={(e) => setForm({ ...form, Nearby_Hospitals: e.target.value })} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}><Car className="w-4 h-4 text-indigo-500" /> Parking Space</Label>
                  <Select value={form.Parking_Space} onValueChange={(v) => setForm({ ...form, Parking_Space: v })}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}><Shield className="w-4 h-4 text-indigo-500" /> Security</Label>
                  <Select value={form.Security} onValueChange={(v) => setForm({ ...form, Security: v })}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-3">
                <Label className={labelClass}><Sparkles className="w-4 h-4 text-indigo-500" /> Amenities</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {amenitiesList.map((a) => (
                    <button
                      key={a}
                      onClick={() => toggleAmenity(a)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${form.Amenities.includes(a)
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-600"
                        : "border-border text-muted-foreground hover:border-indigo-500/40 hover:bg-secondary"
                        }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${form.Amenities.includes(a) ? "border-indigo-500 bg-indigo-500" : "border-muted-foreground/40"
                        }`}>
                        {form.Amenities.includes(a) && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                      </div>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Market Dynamics */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                  </div>
                  Market Conditions
                </h2>
                <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-full text-xs font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Optional Forecast Multipliers
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className={labelClass}><Percent className="w-4 h-4 text-indigo-500" /> Interest Rates</Label>
                  <Select value={form.interest_rates} onValueChange={(v) => setForm({ ...form, interest_rates: v })}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Normal" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low Rates (Growth)</SelectItem>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="High">High Rates (Slowdown)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground pt-1">High rates decrease borrowing power.</p>
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}><Factory className="w-4 h-4 text-indigo-500" /> Economic Outlook</Label>
                  <Select value={form.economic_outlook} onValueChange={(v) => setForm({ ...form, economic_outlook: v })}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Stable" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Booming">Booming Economy (Growth)</SelectItem>
                      <SelectItem value="Stable">Stable</SelectItem>
                      <SelectItem value="Recession">Recession (Decline)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground pt-1">Recessions lead to job loss and sell-offs.</p>
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}><Home className="w-4 h-4 text-indigo-500" /> Housing Supply</Label>
                  <Select value={form.housing_supply} onValueChange={(v) => setForm({ ...form, housing_supply: v })}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Balanced" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low Supply">Low Supply (Scarcity)</SelectItem>
                      <SelectItem value="Balanced">Balanced</SelectItem>
                      <SelectItem value="Oversupply">Oversupply (Surplus)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground pt-1">Oversupply pushes prices downward.</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="rounded-full px-6 h-12 gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>

            <div className="text-sm text-muted-foreground font-medium">
              Step {step} of 4
            </div>

            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                className="gradient-primary text-white font-semibold border-0 rounded-full px-8 h-12 shadow-primary-glow gap-2"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handlePredict}
                disabled={loading}
                className="gradient-accent text-white font-semibold border-0 rounded-full px-8 h-12 shadow-accent-glow min-w-[180px] gap-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </div>
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Predict Price
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}