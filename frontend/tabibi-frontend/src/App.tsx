import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";

import Landing from "@/routes/visitor/Landing";
import Login from "@/routes/visitor/Login";
import Register from "@/routes/visitor/Register";
import SearchResults from "@/routes/visitor/SearchResults";
import DoctorPublicProfile from "@/routes/visitor/DoctorPublicProfile";
import NotFound from "@/routes/visitor/NotFound";

import PatientDashboard from "@/routes/patient/PatientDashboard";
import MyAppointments from "@/routes/patient/MyAppointments";
import BookingWizard from "@/routes/patient/BookingWizard";
import AppointmentDetail from "@/routes/patient/AppointmentDetail";
import PatientProfile from "@/routes/patient/PatientProfile";

import DoctorDashboardPage from "@/routes/doctor/DoctorDashboard";
import AppointmentManagement from "@/routes/doctor/AppointmentManagement";
import DoctorAppointmentDetail from "@/routes/doctor/DoctorAppointmentDetail";
import ScheduleManagement from "@/routes/doctor/ScheduleManagement";
import DoctorProfilePage from "@/routes/doctor/DoctorProfile";

import AdminDashboard from "@/routes/admin/AdminDashboard";
import DoctorManagement from "@/routes/admin/DoctorManagement";
import CreateDoctor from "@/routes/admin/CreateDoctor";
import EditDoctor from "@/routes/admin/EditDoctor";
import UserManagement from "@/routes/admin/UserManagement";
import UserDetailEdit from "@/routes/admin/UserDetailEdit";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctors" element={<SearchResults />} />
          <Route path="/doctors/:id" element={<DoctorPublicProfile />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route
          element={
            <ProtectedRoute role="PATIENT">
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/appointments" element={<MyAppointments />} />
          <Route path="/patient/appointments/book" element={<BookingWizard />} />
          <Route path="/patient/appointments/:id" element={<AppointmentDetail />} />
          <Route path="/patient/profile" element={<PatientProfile />} />
        </Route>

        <Route
          element={
            <ProtectedRoute role="DOCTOR">
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
          <Route path="/doctor/appointments" element={<AppointmentManagement />} />
          <Route path="/doctor/appointments/:id" element={<DoctorAppointmentDetail />} />
          <Route path="/doctor/schedule" element={<ScheduleManagement />} />
          <Route path="/doctor/profile" element={<DoctorProfilePage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute role="ADMIN">
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/doctors" element={<DoctorManagement />} />
          <Route path="/admin/doctors/new" element={<CreateDoctor />} />
          <Route path="/admin/doctors/:id" element={<EditDoctor />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/users/:id" element={<UserDetailEdit />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
