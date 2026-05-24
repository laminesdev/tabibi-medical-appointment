import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarCheck,
  Search,
  User,
  Clock,
  Users,
  Stethoscope,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const patientNav = [
  { label: "Dashboard", path: "/patient/dashboard", icon: LayoutDashboard },
  { label: "Find Doctors", path: "/doctors", icon: Search },
  { label: "My Appointments", path: "/patient/appointments", icon: CalendarCheck },
  { label: "Profile", path: "/patient/profile", icon: User },
];

const doctorNav = [
  { label: "Dashboard", path: "/doctor/dashboard", icon: LayoutDashboard },
  { label: "Appointments", path: "/doctor/appointments", icon: CalendarCheck },
  { label: "Schedule", path: "/doctor/schedule", icon: Clock },
  { label: "Profile", path: "/doctor/profile", icon: User },
];

const adminNav = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Doctors", path: "/admin/doctors", icon: Stethoscope },
  { label: "Users", path: "/admin/users", icon: Users },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const getNavItems = () => {
    switch (user?.role) {
      case "PATIENT": return patientNav;
      case "DOCTOR": return doctorNav;
      case "ADMIN": return adminNav;
      default: return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex flex-col h-full bg-white border-r">
      <div className="p-6 border-b">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">T</span>
          </div>
          <span className="text-xl font-bold">Tabibi</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
