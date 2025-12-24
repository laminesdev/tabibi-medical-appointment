export class NotificationUtils {
   static buildAppointmentNotification(type: string, appointmentData: any) {
      const messages: Record<string, { title: string; message: string }> = {
         APPOINTMENT_BOOKED: {
            title: "Appointment Booked",
            message: `Your appointment has been booked for ${appointmentData.date}`,
         },
         APPOINTMENT_CONFIRMED: {
            title: "Appointment Confirmed",
            message: `Your appointment has been confirmed for ${appointmentData.date}`,
         },
         APPOINTMENT_CANCELLED: {
            title: "Appointment Cancelled",
            message: "Your appointment has been cancelled",
         },
         APPOINTMENT_REMINDER: {
            title: "Appointment Reminder",
            message: `You have an appointment tomorrow`,
         },
      };

      return (
         messages[type] || {
            title: "Notification",
            message: "Update on your appointment",
         }
      );
   }
}
