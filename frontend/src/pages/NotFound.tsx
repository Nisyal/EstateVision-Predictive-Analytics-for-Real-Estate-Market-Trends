import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-6 animate-slide-up">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-8 shadow-primary-glow">
          <AlertTriangle className="w-10 h-10 text-white" />
        </div>
        <h1 className="font-display text-7xl font-bold text-gradient-primary mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Oops! This page doesn't exist.
        </p>
        <Link to="/">
          <Button className="gradient-primary text-white font-semibold rounded-full px-8 h-12 shadow-primary-glow gap-2">
            <Home className="w-4 h-4" /> Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
