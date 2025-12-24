export class IdUtils {
   static generateNanoId(length: number = 16): string {
      const alphabet =
         "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      let result = "";

      for (let i = 0; i < length; i++) {
         const randomIndex = Math.floor(Math.random() * alphabet.length);
         result += alphabet[randomIndex];
      }

      return result;
   }

   static generateAppointmentId(): string {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 8);
      return `APT-${timestamp}-${random}`.toUpperCase();
   }

   static generateToken(): string {
      const randomBytes = new Array(32);
      for (let i = 0; i < 32; i++) {
         randomBytes[i] = Math.floor(Math.random() * 256);
      }
      return Buffer.from(randomBytes)
         .toString("base64")
         .replace(/[^a-zA-Z0-9]/g, "")
         .substring(0, 32);
   }

   static generateVerificationCode(length: number = 6): string {
      const numbers = "0123456789";
      let code = "";

      for (let i = 0; i < length; i++) {
         code += numbers[Math.floor(Math.random() * numbers.length)];
      }

      return code;
   }

   static isValidUuid(uuid: string): boolean {
      const uuidRegex =
         /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(uuid);
   }

   static maskEmail(email: string): string {
      const [localPart, domain] = email.split("@");
      if (!localPart || !domain) return email;

      if (localPart.length <= 2) {
         return "*".repeat(localPart.length) + "@" + domain;
      }

      const maskedLocal =
         localPart[0] +
         "*".repeat(localPart.length - 2) +
         localPart[localPart.length - 1];
      return `${maskedLocal}@${domain}`;
   }

   static maskPhone(phone: string): string {
      if (phone.length <= 4) return phone;

      const lastFour = phone.slice(-4);
      const masked = "*".repeat(phone.length - 4);
      return masked + lastFour;
   }

   static generateSlug(text: string): string {
      return text
         .toLowerCase()
         .replace(/[^\w\s-]/g, "") // Remove special characters
         .replace(/\s+/g, "-") // Replace spaces with hyphens
         .replace(/--+/g, "-") // Replace multiple hyphens with single hyphen
         .trim();
   }

   static generateFileName(originalName: string): string {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 10);
      const extension = originalName.includes(".")
         ? originalName.substring(originalName.lastIndexOf("."))
         : "";

      return `${timestamp}-${random}${extension}`;
   }
}
