import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();

  const getDashboardLink = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "PATIENT": return "/patient/dashboard";
      case "DOCTOR": return "/doctor/dashboard";
      case "ADMIN": return "/admin/dashboard";
      default: return "/login";
    }
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">T</span>
          </div>
          <span className="text-xl font-bold text-foreground">Tabibi</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/doctors" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Find Doctors
          </Link>

          {isAuthenticated ? (
            <>
              <Link to={getDashboardLink()}>
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
