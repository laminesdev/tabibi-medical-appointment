import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";

export default function MyAppointments() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Appointments</h1>
        <Link to="/patient/appointments/book">
          <Button className="gap-2">
            <CalendarPlus className="w-4 h-4" />
            Book Appointment
          </Button>
        </Link>
      </div>
      <p className="text-muted-foreground">Appointment list coming in Phase 3.</p>
    </div>
  );
}
