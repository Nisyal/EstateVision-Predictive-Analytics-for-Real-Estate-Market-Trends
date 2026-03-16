import { useState, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGoogleLogin } from "@react-oauth/google";
import {
    Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, ShieldCheck, CheckCircle2, User
} from "lucide-react";

/* ── password strength helper ── */
function getStrength(pwd: string) {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { label: "Weak", color: "bg-red-500", text: "text-red-400", pct: 33 };
    if (score <= 3) return { label: "Medium", color: "bg-amber-500", text: "text-amber-400", pct: 66 };
    return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-400", pct: 100 };
}

/* ── simple math captcha ── */
function generateCaptcha() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    return { question: `${a} + ${b} = ?`, answer: a + b };
}

export default function Login() {
    const { login, register, loginWithGoogle, resetPassword } = useAuth();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetStep, setResetStep] = useState(1);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [captcha, setCaptcha] = useState(() => generateCaptcha());
    const [captchaInput, setCaptchaInput] = useState("");

    const strength = useMemo(() => getStrength(password), [password]);
    const passwordsMatch = confirmPwd.length > 0 && password === confirmPwd;
    const passwordsMismatch = confirmPwd.length > 0 && password !== confirmPwd;

    const resetForm = useCallback(() => {
        setUsername(""); setEmail(""); setPassword(""); setConfirmPwd("");
        setCaptchaInput(""); setCaptcha(generateCaptcha()); setError(""); setSuccessMessage("");
        setIsForgotPassword(false); setResetStep(1);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (isForgotPassword) {
            if (resetStep === 1) {
                // Just moving to step 2 for the simplified flow
                if (!email) { setError("Please enter your email"); return; }
                setResetStep(2);
                return;
            } else {
                if (password !== confirmPwd) { setError("Passwords do not match"); return; }
                if (strength.pct < 66) { setError("Please create a stronger password (use uppercase, lowercase, numbers & symbols)"); return; }

                setLoading(true);
                try {
                    await resetPassword(email, password);
                    setSuccessMessage("Password successfully reset! You can now sign in.");
                    // Reset back to standard login screen after a delay
                    setTimeout(() => {
                        resetForm();
                        setIsLogin(true);
                    }, 3000);
                } catch (err: any) {
                    setError(err.message || "Something went wrong resetting password");
                } finally {
                    setLoading(false);
                }
                return;
            }
        }

        if (!isLogin) {
            if (!username.trim()) { setError("Username is required"); return; }
            if (password !== confirmPwd) { setError("Passwords do not match"); return; }
            if (strength.pct < 66) { setError("Please create a stronger password (use uppercase, lowercase, numbers & symbols)"); return; }
            if (parseInt(captchaInput) !== captcha.answer) {
                setError("Incorrect captcha answer");
                setCaptcha(generateCaptcha());
                setCaptchaInput("");
                return;
            }
        }

        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(username.trim(), email, password);
            }
            navigate("/");
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setError("");
            setLoading(true);
            try {
                // Pass the access_token (credential) back to our API
                await loginWithGoogle(tokenResponse.access_token);
                navigate("/");
            } catch (err: any) {
                setError(err.message || "Google Single Sign-On failed");
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            setError("Google Single Sign-On failed");
        }
    });

    return (
        <div className="min-h-screen flex items-center justify-center gradient-hero relative overflow-hidden px-6">
            <div className="absolute inset-0 dot-grid opacity-15" />
            <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl animate-float" />
            <div className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl animate-float delay-300" />

            <div className="relative w-full max-w-md animate-slide-up">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2.5" onClick={() => resetForm()}>
                        <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-primary-glow">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-display font-bold text-2xl text-white">
                            House<span className="text-gradient-accent">AI</span>
                        </span>
                    </Link>
                    <p className="text-white/50 mt-3 text-sm">
                        {isForgotPassword ? (resetStep === 1 ? "Enter your email to reset password." : "Create a new password.") : isLogin ? "Welcome back! Sign in to continue." : "Create an account to get started."}
                    </p>
                </div>

                <div className="glass-dark rounded-3xl p-8 shadow-elevated border border-white/10 relative overflow-hidden">
                    {/* Only show header toggles if NOT in forgot password mode */}
                    {!isForgotPassword && (
                        <div className="flex bg-white/5 rounded-full p-1 mb-7">
                            <button
                                onClick={() => { setIsLogin(true); resetForm(); }}
                                className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${isLogin ? "gradient-primary text-white shadow-md" : "text-white/50 hover:text-white/80"
                                    }`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => { setIsLogin(false); resetForm(); }}
                                className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${!isLogin ? "gradient-primary text-white shadow-md" : "text-white/50 hover:text-white/80"
                                    }`}
                            >
                                Sign Up
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 p-3 mb-5 rounded-xl bg-red-500/15 border border-red-500/25 text-red-300 text-sm animate-fade-in">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="flex items-center gap-2 p-3 mb-5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-sm animate-fade-in">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && !isForgotPassword && (
                            <div className="space-y-2 animate-fade-in">
                                <Label className="text-white/70 text-sm flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" /> Username
                                </Label>
                                <Input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="johndoe"
                                    required
                                    className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500 focus:ring-indigo-500/30"
                                />
                            </div>
                        )}

                        {(!isForgotPassword || resetStep === 1) && (
                            <div className="space-y-2">
                                <Label className="text-white/70 text-sm flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5" /> Email Address
                                </Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500 focus:ring-indigo-500/30"
                                />
                            </div>
                        )}

                        {(!isForgotPassword || resetStep === 2) && (
                            <div className="space-y-2">
                                <Label className="text-white/70 text-sm flex items-center gap-2">
                                    <Lock className="w-3.5 h-3.5" /> {isForgotPassword ? "New Password" : "Password"}
                                </Label>
                                <div className="relative">
                                    <Input
                                        type={showPwd ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500 focus:ring-indigo-500/30 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd(!showPwd)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                    >
                                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                {isLogin && !isForgotPassword && (
                                    <div className="flex justify-end pt-1">
                                        <button
                                            type="button"
                                            onClick={() => { setIsForgotPassword(true); setError(""); }}
                                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                )}

                                {!isLogin && password.length > 0 && (
                                    <div className="space-y-1.5 animate-fade-in">
                                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                                                style={{ width: `${strength.pct}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className={strength.text}>
                                                {strength.label} password
                                            </span>
                                            <span className="text-white/30">
                                                Use 8+ chars, uppercase, numbers & symbols
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {(!isLogin || (isForgotPassword && resetStep === 2)) && (
                            <div className="space-y-2 animate-fade-in">
                                <Label className="text-white/70 text-sm flex items-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Confirm Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        type={showConfirm ? "text" : "password"}
                                        value={confirmPwd}
                                        onChange={(e) => setConfirmPwd(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className={`h-12 rounded-xl bg-white/5 text-white placeholder:text-white/30 focus:ring-indigo-500/30 pr-12 ${passwordsMatch ? "border-emerald-500/50" : passwordsMismatch ? "border-red-500/50" : "border-white/10"
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                    >
                                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {passwordsMatch && (
                                    <p className="text-xs text-emerald-400 flex items-center gap-1 animate-fade-in">
                                        <CheckCircle2 className="w-3 h-3" /> Passwords match
                                    </p>
                                )}
                                {passwordsMismatch && (
                                    <p className="text-xs text-red-400 animate-fade-in">Passwords do not match</p>
                                )}
                            </div>
                        )}

                        {!isLogin && !isForgotPassword && (
                            <div className="space-y-2 animate-fade-in">
                                <Label className="text-white/70 text-sm flex items-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Security Check
                                </Label>
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 font-mono text-lg font-bold tracking-wider select-none">
                                        {captcha.question}
                                    </div>
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        value={captchaInput}
                                        onChange={(e) => setCaptchaInput(e.target.value)}
                                        placeholder="Answer"
                                        required
                                        className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500 focus:ring-indigo-500/30"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { setCaptcha(generateCaptcha()); setCaptchaInput(""); }}
                                        className="text-white/30 hover:text-white/60 text-xs whitespace-nowrap"
                                    >
                                        ↻ New
                                    </button>
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 gradient-accent text-white font-semibold rounded-xl shadow-accent-glow border-0 gap-2 text-base"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {isForgotPassword ? "Updating..." : isLogin ? "Signing in..." : "Creating account..."}
                                </div>
                            ) : (
                                <>
                                    {isForgotPassword ? (resetStep === 1 ? "Continue" : "Reset Password") : isLogin ? "Sign In" : "Create Account"} <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>

                        {isForgotPassword && (
                            <button
                                type="button"
                                onClick={() => resetForm()}
                                className="w-full text-center text-sm text-white/50 hover:text-white/80 transition-colors mt-4"
                            >
                                Back to login
                            </button>
                        )}

                        {!isForgotPassword && (
                            <>
                                <div className="relative flex items-center py-2">
                                    <div className="flex-grow border-t border-white/10"></div>
                                    <span className="flex-shrink-0 mx-4 text-white/40 text-xs uppercase tracking-wider">Or continue with</span>
                                    <div className="flex-grow border-t border-white/10"></div>
                                </div>

                                <Button
                                    type="button"
                                    onClick={() => handleGoogleLogin()}
                                    disabled={loading}
                                    className="w-full h-12 bg-white hover:bg-white/90 text-gray-900 font-semibold rounded-xl border-0 gap-3 text-base flex justify-center items-center transition-all"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                        <path d="M1 1h22v22H1z" fill="none" />
                                    </svg>
                                    Sign in with Google
                                </Button>
                            </>
                        )}
                    </form>
                </div>

                <p className="text-center text-white/30 text-sm mt-6">
                    Real Estate Market Intelligence Engine
                </p>
            </div>
        </div>
    );
}
