import dayjs from "dayjs";

export class DateTimeUtils {
   static formatDate(date: Date): string {
      return dayjs(date).format("YYYY-MM-DD");
   }

   static formatDateTime(date: Date): string {
      return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
   }

   static formatTime(date: Date): string {
      return dayjs(date).format("HH:mm");
   }

   static parseDate(dateString: string): Date {
      return dayjs(dateString).toDate();
   }

   static isToday(date: Date): boolean {
      return dayjs(date).isSame(dayjs(), "day");
   }

   static isTomorrow(date: Date): boolean {
      return dayjs(date).isSame(dayjs().add(1, "day"), "day");
   }

   static isYesterday(date: Date): boolean {
      return dayjs(date).isSame(dayjs().subtract(1, "day"), "day");
   }

   static isPast(date: Date): boolean {
      return dayjs(date).isBefore(dayjs());
   }

   static isFuture(date: Date): boolean {
      return dayjs(date).isAfter(dayjs());
   }

   static addDays(date: Date, days: number): Date {
      return dayjs(date).add(days, "day").toDate();
   }

   static subtractDays(date: Date, days: number): Date {
      return dayjs(date).subtract(days, "day").toDate();
   }

   static getStartOfDay(date: Date): Date {
      return dayjs(date).startOf("day").toDate();
   }

   static getEndOfDay(date: Date): Date {
      return dayjs(date).endOf("day").toDate();
   }

   static getDaysBetween(start: Date, end: Date): number {
      return dayjs(end).diff(dayjs(start), "day");
   }

   static getHoursBetween(start: Date, end: Date): number {
      return dayjs(end).diff(dayjs(start), "hour");
   }

   static getMinutesBetween(start: Date, end: Date): number {
      return dayjs(end).diff(dayjs(start), "minute");
   }

   static isWeekend(date: Date): boolean {
      const day = dayjs(date).day();
      return day === 0 || day === 6; // Sunday or Saturday
   }

   static isWeekday(date: Date): boolean {
      return !this.isWeekend(date);
   }

   static formatRelative(date: Date): string {
      const now = dayjs();
      const target = dayjs(date);
      const diffMinutes = target.diff(now, "minute");
      const diffHours = target.diff(now, "hour");
      const diffDays = target.diff(now, "day");

      if (diffMinutes === 0) return "now";
      if (diffMinutes > 0 && diffMinutes < 60)
         return `in ${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`;
      if (diffMinutes < 0 && diffMinutes > -60)
         return `${Math.abs(diffMinutes)} minute${
            Math.abs(diffMinutes) !== 1 ? "s" : ""
         } ago`;

      if (diffHours > 0 && diffHours < 24)
         return `in ${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
      if (diffHours < 0 && diffHours > -24)
         return `${Math.abs(diffHours)} hour${
            Math.abs(diffHours) !== 1 ? "s" : ""
         } ago`;

      if (diffDays === 0) return "today";
      if (diffDays === 1) return "tomorrow";
      if (diffDays === -1) return "yesterday";
      if (diffDays > 1 && diffDays <= 7) return `in ${diffDays} days`;
      if (diffDays < -1 && diffDays >= -7)
         return `${Math.abs(diffDays)} days ago`;

      return target.format("MMM D, YYYY");
   }
}
