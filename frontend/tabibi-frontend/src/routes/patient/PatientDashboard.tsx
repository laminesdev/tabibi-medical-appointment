import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Search, ArrowRight } from "lucide-react";

export default function PatientDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-primary/5 rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-1">Welcome back!</h1>
        <p className="text-muted-foreground">Manage your appointments and healthcare journey.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/doctors">
          <div className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <Search className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1">Find a Doctor</h3>
            <p className="text-sm text-muted-foreground">Search for doctors by specialty or location</p>
          </div>
        </Link>
        <Link to="/patient/appointments/book">
          <div className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <CalendarCheck className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1">Book Appointment</h3>
            <p className="text-sm text-muted-foreground">Schedule a new appointment</p>
          </div>
        </Link>
        <Link to="/patient/appointments">
          <div className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <ArrowRight className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1">My Appointments</h3>
            <p className="text-sm text-muted-foreground">View and manage your appointments</p>
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
        <p className="text-muted-foreground text-sm">No upcoming appointments.</p>
        <Link to="/patient/appointments/book">
          <Button variant="outline" size="sm" className="mt-3 gap-2">
            Book Now <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
