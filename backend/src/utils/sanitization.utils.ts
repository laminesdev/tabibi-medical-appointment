export class SanitizationUtils {
   static sanitizeText(text: string, maxLength: number = 1000): string {
      if (!text) return text;

      // Truncate first
      const truncated =
         text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

      // Basic HTML sanitization (remove script tags and dangerous attributes)
      const sanitized = truncated
         .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
         .replace(/on\w+="[^"]*"/g, "")
         .replace(/on\w+='[^']*'/g, "")
         .replace(/javascript:/gi, "")
         .replace(/data:/gi, "");

      return sanitized.trim();
   }

   static sanitizeName(name: string): string {
      if (!name) return name;

      // Remove any HTML tags
      const sanitized = name.replace(/<[^>]*>/g, "").trim();

      // Remove extra whitespace and limit to reasonable length
      return sanitized.replace(/\s+/g, " ").substring(0, 100);
   }

   static sanitizeEmail(email: string): string {
      if (!email) return email;

      // Convert to lowercase and trim
      const sanitized = email.toLowerCase().trim();

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitized)) {
         throw new Error("Invalid email format");
      }

      return sanitized;
   }

   static sanitizePhone(phone: string): string {
      if (!phone) return phone;

      // Remove all non-digit characters except leading +
      let sanitized = phone.replace(/[^\d+]/g, "");

      // If it starts with +, keep it, otherwise ensure it's digits only
      if (!sanitized.startsWith("+")) {
         sanitized = sanitized.replace(/\D/g, "");
      }

      return sanitized.trim();
   }

   static sanitizeObject<T extends Record<string, any>>(
      obj: T,
      fields: Partial<
         Record<keyof T, "text" | "name" | "email" | "phone" | "none">
      >
   ): T {
      const sanitized: any = { ...obj };

      for (const [key, type] of Object.entries(fields)) {
         if (sanitized[key] && typeof sanitized[key] === "string") {
            try {
               switch (type) {
                  case "text":
                     sanitized[key] = this.sanitizeText(sanitized[key]);
                     break;
                  case "name":
                     sanitized[key] = this.sanitizeName(sanitized[key]);
                     break;
                  case "email":
                     sanitized[key] = this.sanitizeEmail(sanitized[key]);
                     break;
                  case "phone":
                     sanitized[key] = this.sanitizePhone(sanitized[key]);
                     break;
                  case "none":
                  default:
                     // No sanitization, just trim
                     sanitized[key] = String(sanitized[key]).trim();
                     break;
               }
            } catch (error) {
               // If sanitization fails, remove the field
               console.warn(`Failed to sanitize field ${key}:`, error);
               delete sanitized[key];
            }
         }
      }

      return sanitized;
   }
}
