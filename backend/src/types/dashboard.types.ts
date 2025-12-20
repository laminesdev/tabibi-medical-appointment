export type DashboardStats = {
   totalUsers: number;
   totalPatients: number;
   totalDoctors: number;
   totalAdmins: number;
   totalAppointments: number;
   upcomingAppointments: number;
   pendingAppointments: number;
   completedAppointments: number;
   cancelledAppointments: number;
   revenue?: number;
   monthlyStats: MonthlyStat[];
};

export type MonthlyStat = {
   month: string;
   appointments: number;
   newPatients: number;
   revenue?: number;
};

export type AdminDashboardQuery = {
   startDate?: Date;
   endDate?: Date;
   groupBy?: "day" | "week" | "month";
};

export type DoctorDashboardStats = {
   totalAppointments: number;
   upcomingAppointments: number;
   completedAppointments: number;
   cancellationRate: number;
   averageRating: number;
   totalRevenue?: number;
   monthlyAppointments: MonthlyStat[];
};

export type PatientDashboardStats = {
   totalAppointments: number;
   upcomingAppointments: number;
   pastAppointments: number;
   favoriteDoctors: Array<{
      doctorId: string;
      doctorName: string;
      appointmentCount: number;
   }>;
};
