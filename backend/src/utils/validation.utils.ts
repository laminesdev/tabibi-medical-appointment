export class ValidationUtils {
   static isValidEmail(email: string): boolean {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
   }

   static isValidPhone(phone: string): boolean {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      return phoneRegex.test(phone);
   }

   static isValidPassword(password: string): boolean {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      return passwordRegex.test(password);
   }

   static sanitizeString(input: string): string {
      return input.trim().replace(/\s+/g, " ");
   }

   static validateTimeRange(startTime: string, endTime: string, minDurationMinutes: number = 15): boolean {
      if (
         !this.isValidTimeFormat(startTime) ||
         !this.isValidTimeFormat(endTime)
      ) {
         return false;
      }

      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      const startTotal = startHour * 60 + startMinute;
      const endTotal = endHour * 60 + endMinute;
      const duration = endTotal - startTotal;

      // FIXED: Require minimum duration
      return duration >= minDurationMinutes;
   }

   static isValidTimeFormat(time: string): boolean {
      return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
   }

   static isDateInPast(date: Date): boolean {
      return date < new Date();
   }

   static isDateInFuture(date: Date): boolean {
      return date > new Date();
   }

   static validateDateRange(startDate: Date, endDate: Date): boolean {
      return startDate < endDate;
   }
}
