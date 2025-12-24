export class EmailUtils {
   static async sendAppointmentConfirmation(
      to: string,
      appointmentData: any
   ): Promise<void> {
      // Implementation with nodemailer or your email service
      console.log(`Sending appointment confirmation to ${to}`, appointmentData);
   }

   static async sendAppointmentReminder(
      to: string,
      appointmentData: any
   ): Promise<void> {
      console.log(`Sending appointment reminder to ${to}`, appointmentData);
   }

   static async sendCancellationNotice(
      to: string,
      appointmentData: any
   ): Promise<void> {
      console.log(`Sending cancellation notice to ${to}`, appointmentData);
   }
}
