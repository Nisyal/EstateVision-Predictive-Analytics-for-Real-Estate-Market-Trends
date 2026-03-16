import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Brain, TrendingUp, LayoutDashboard, Menu, X, Sparkles, BookOpen, LogOut, User, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Predict", path: "/predict", icon: Brain },
  { label: "Forecast", path: "/forecast", icon: TrendingUp },
  { label: "Pricing", path: "/pricing", icon: CreditCard },
  { label: "Docs", path: "/docs", icon: BookOpen },
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "glass shadow-elevated" : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-primary-glow transition-transform group-hover:scale-110">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            <span className={scrolled ? "text-foreground" : "text-white"}>Estate</span>
            <span className="text-gradient-primary">Edge</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-1.5 py-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${active
                  ? "gradient-primary text-white shadow-primary-glow"
                  : scrolled
                    ? "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-full flex items-center justify-center gradient-primary text-white font-bold shadow-md hover:scale-105 transition-transform border border-white/20 overflow-hidden select-none outline-none">
                  {user?.icon && user.icon.startsWith("http") ? (
                    <img src={user.icon} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 glass-dark border-white/10 text-white mt-2 p-2 rounded-xl shadow-elevated">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-white/50">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10 my-2" />
                <DropdownMenuItem asChild className="hover:bg-white/10 focus:bg-white/10 cursor-pointer rounded-lg">
                  <Link to="/profile" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4 text-indigo-400" />
                    <span>Edit Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="hover:bg-red-500/20 focus:bg-red-500/20 cursor-pointer text-red-400 focus:text-red-400 rounded-lg mt-1">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button
                size="sm"
                className="gradient-accent text-white font-semibold shadow-accent-glow hover:shadow-none transition-all duration-300 border-0 rounded-full px-6"
              >
                <Brain className="w-4 h-4 mr-1.5" />
                Sign In
              </Button>
            </Link>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <X className={`w-5 h-5 ${scrolled ? "text-foreground" : "text-white"}`} />
          ) : (
            <Menu className={`w-5 h-5 ${scrolled ? "text-foreground" : "text-white"}`} />
          )}
        </button>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="glass border-t border-white/10 px-6 py-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? "gradient-primary text-white" : "text-foreground hover:bg-secondary"
                  }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2 px-4 py-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center gradient-primary text-white font-bold overflow-hidden">
                    {user?.icon && user.icon.startsWith("http") ? (
                      <img src={user.icon} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-foreground font-medium leading-none">{user?.name}</span>
                    <span className="text-xs text-muted-foreground mt-1">{user?.email}</span>
                  </div>
                </div>
                <Link to="/profile" onClick={() => setOpen(false)}>
                  <Button size="sm" variant="ghost" className="w-full justify-start gap-2 text-foreground">
                    <User className="w-4 h-4" /> Edit Profile
                  </Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={() => { logout(); setOpen(false); }} className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10">
                  <LogOut className="w-4 h-4" /> Logout
                </Button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full gradient-accent text-white font-semibold border-0 rounded-xl">
                  <Brain className="w-4 h-4 mr-1.5" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
