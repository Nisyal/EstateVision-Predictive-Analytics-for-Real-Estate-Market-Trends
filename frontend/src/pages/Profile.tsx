import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Shield, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const { user, token, updateUser, logout } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState(user?.name || "");

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [loadingUsername, setLoadingUsername] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleUsernameChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !username.trim() || username === user.name) return;
        setLoadingUsername(true);
        setMessage("");
        setError("");

        try {
            const res = await fetch("http://localhost:8004/auth/update-profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name: username.trim() })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Failed to update username");

            updateUser({ name: username.trim() });
            navigate("/");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoadingUsername(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
            setError("Please fill all password fields.");
            return;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        setLoadingPassword(true);
        setMessage("");
        setError("");

        try {
            const res = await fetch("http://localhost:8004/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    current_password: passwords.currentPassword,
                    new_password: passwords.newPassword
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Failed to change password");

            setMessage("Password changed successfully!");
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });

            // Log out and redirect
            setTimeout(() => {
                logout();
                navigate("/login");
            }, 1000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoadingPassword(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen gradient-hero">
            <Navbar />

            <div className="pt-24 pb-16 px-6 max-w-3xl mx-auto animate-fade-in">
                <h1 className="text-3xl font-display font-bold text-white mb-8">Edit Profile</h1>

                {message && (
                    <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
                        <Check className="w-4 h-4" /> {message}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    <div className="glass-dark border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-400" /> Edit Username
                        </h2>

                        <form onSubmit={handleUsernameChange} className="space-y-4 max-w-sm">
                            <div className="space-y-2">
                                <Label className="text-white/70">Username</Label>
                                <Input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-indigo-500"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loadingUsername || username.trim() === user?.name || !username.trim()}
                                className="gradient-primary text-white font-semibold border-0 rounded-xl mt-2 w-full"
                            >
                                {loadingUsername ? "Saving..." : "Save Username"}
                            </Button>
                        </form>
                    </div>

                    <div className="glass-dark border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-amber-400" /> Change Password
                        </h2>

                        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
                            <div className="space-y-2">
                                <Label className="text-white/70">Current Password</Label>
                                <Input
                                    type="password"
                                    value={passwords.currentPassword}
                                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/70">New Password</Label>
                                <Input
                                    type="password"
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/70">Confirm New Password</Label>
                                <Input
                                    type="password"
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-500"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loadingPassword}
                                className="gradient-accent text-white font-semibold border-0 rounded-xl w-full mt-2"
                            >
                                {loadingPassword ? "Updating..." : "Update Password"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
