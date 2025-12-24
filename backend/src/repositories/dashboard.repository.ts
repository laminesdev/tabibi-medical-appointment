import { BaseRepository } from "./base.repository";

export interface DashboardStatsQuery {
   startDate?: Date;
   endDate?: Date;
}

export class DashboardRepository extends BaseRepository {
   async getAdminDashboardStats(query?: DashboardStatsQuery): Promise<any> {
      const { startDate, endDate } = query || {};

      // Build date filter
      const dateFilter: any = {};
      if (startDate) dateFilter.gte = startDate;
      if (endDate) dateFilter.lte = endDate;

      const [
         totalUsers,
         totalPatients,
         totalDoctors,
         totalAdmins,
         totalAppointments,
         upcomingAppointments,
         pendingAppointments,
         completedAppointments,
         cancelledAppointments,
         recentAppointments,
      ] = await Promise.all([
         this.prisma.user.count(),
         this.prisma.user.count({ where: { role: "PATIENT" } }),
         this.prisma.user.count({ where: { role: "DOCTOR" } }),
         this.prisma.user.count({ where: { role: "ADMIN" } }),
         this.prisma.appointment.count(),
         this.prisma.appointment.count({
            where: {
               date: { gte: new Date() },
               status: "CONFIRMED",
            },
         }),
         this.prisma.appointment.count({ where: { status: "PENDING" } }),
         this.prisma.appointment.count({ where: { status: "COMPLETED" } }),
         this.prisma.appointment.count({ where: { status: "CANCELLED" } }),
         this.prisma.appointment.findMany({
            where:
               dateFilter.startDate || dateFilter.endDate
                  ? { date: dateFilter }
                  : undefined,
            include: {
               patient: { include: { user: true } },
               doctor: { include: { user: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
         }),
      ]);

      return {
         totalUsers,
         totalPatients,
         totalDoctors,
         totalAdmins,
         totalAppointments,
         upcomingAppointments,
         pendingAppointments,
         completedAppointments,
         cancelledAppointments,
         recentAppointments,
      };
   }

   async getDoctorDashboardStats(doctorId: string): Promise<any> {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      const [
         totalAppointments,
         upcomingAppointments,
         completedAppointments,
         cancelledAppointments,
         weeklyAppointments,
         patientStats,
      ] = await Promise.all([
         this.prisma.appointment.count({ where: { doctorId } }),
         this.prisma.appointment.count({
            where: {
               doctorId,
               date: { gte: today },
               status: { in: ["PENDING", "CONFIRMED"] },
            },
         }),
         this.prisma.appointment.count({
            where: { doctorId, status: "COMPLETED" },
         }),
         this.prisma.appointment.count({
            where: { doctorId, status: "CANCELLED" },
         }),
         this.prisma.appointment.groupBy({
            by: ["date"],
            where: {
               doctorId,
               date: { gte: startOfWeek },
            },
            _count: true,
         }),
         this.prisma.appointment.groupBy({
            by: ["patientId"],
            where: { doctorId },
            _count: true,
            orderBy: { _count: { patientId: "desc" } },
            take: 5,
         }),
      ]);

      const cancellationRate =
         totalAppointments > 0
            ? (cancelledAppointments / totalAppointments) * 100
            : 0;

      return {
         totalAppointments,
         upcomingAppointments,
         completedAppointments,
         cancelledAppointments,
         cancellationRate: Math.round(cancellationRate * 100) / 100,
         weeklyAppointments,
         topPatients: patientStats,
      };
   }

   async getPatientDashboardStats(patientId: string): Promise<any> {
      const [
         totalAppointments,
         upcomingAppointments,
         pastAppointments,
         favoriteDoctors,
         recentAppointments,
      ] = await Promise.all([
         this.prisma.appointment.count({ where: { patientId } }),
         this.prisma.appointment.count({
            where: {
               patientId,
               date: { gte: new Date() },
               status: { in: ["PENDING", "CONFIRMED"] },
            },
         }),
         this.prisma.appointment.count({
            where: {
               patientId,
               date: { lt: new Date() },
               status: "COMPLETED",
            },
         }),
         this.prisma.appointment.groupBy({
            by: ["doctorId"],
            where: { patientId },
            _count: true,
            orderBy: { _count: { doctorId: "desc" } },
            take: 3,
         }),
         this.prisma.appointment.findMany({
            where: { patientId },
            include: {
               doctor: { include: { user: true } },
            },
            orderBy: { date: "desc" },
            take: 5,
         }),
      ]);

      return {
         totalAppointments,
         upcomingAppointments,
         pastAppointments,
         favoriteDoctors,
         recentAppointments,
      };
   }
}
