import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
    name: string;
    email: string;
    icon?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: (credential: string) => Promise<void>;
    resetPassword: (email: string, new_password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = "http://localhost:8004";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem("houseai_token");
        const savedUser = localStorage.getItem("houseai_user");
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const saveSession = (tkn: string, usr: User) => {
        setToken(tkn);
        setUser(usr);
        localStorage.setItem("houseai_token", tkn);
        localStorage.setItem("houseai_user", JSON.stringify(usr));
    };

    const register = async (name: string, email: string, password: string) => {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Registration failed");
        }
        const data = await res.json();
        saveSession(data.token, data.user);
    };

    const login = async (email: string, password: string) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Login failed");
        }
        const data = await res.json();
        saveSession(data.token, data.user);
    };

    const loginWithGoogle = async (credential: string) => {
        const res = await fetch(`${API_BASE}/auth/google_login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: credential }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Google Login failed");
        }
        const data = await res.json();
        saveSession(data.token, data.user);
    };

    const resetPassword = async (email: string, new_password: string) => {
        const res = await fetch(`${API_BASE}/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, new_password }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Password reset failed");
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("houseai_token");
        localStorage.removeItem("houseai_user");
    };

    const updateUser = (updates: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem("houseai_user", JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                loading,
                login,
                loginWithGoogle,
                resetPassword,
                register,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
