export class SearchUtils {
   static buildSearchCondition(fields: string[], searchTerm?: string): any {
      if (!searchTerm || !searchTerm.trim()) {
         return undefined;
      }

      const sanitizedTerm = searchTerm.trim();

      return {
         OR: fields.map((field) => ({
            [field]: {
               contains: sanitizedTerm,
               mode: "insensitive" as const,
            },
         })),
      };
   }

   static buildMultiFieldSearch(fields: string[], searchTerm?: string): any {
      if (!searchTerm) return undefined;

      const conditions: any[] = [];

      fields.forEach((field) => {
         const parts = field.split(".");

         if (parts.length === 1) {
            conditions.push({
               [field]: {
                  contains: searchTerm,
                  mode: "insensitive",
               },
            });
         } else {
            // Handle nested fields (e.g., 'user.firstName')
            conditions.push({
               [parts[0]]: {
                  [parts[1]]: {
                     contains: searchTerm,
                     mode: "insensitive",
                  },
               },
            });
         }
      });

      return { OR: conditions };
   }

   static buildFilterCondition(filters: Record<string, any>): any {
      const where: any = {};

      for (const [key, value] of Object.entries(filters)) {
         if (value !== undefined && value !== null && value !== "") {
            if (typeof value === "boolean") {
               where[key] = value;
            } else if (typeof value === "string") {
               where[key] = { contains: value, mode: "insensitive" };
            } else if (Array.isArray(value) && value.length > 0) {
               where[key] = { in: value };
            } else if (value instanceof Date) {
               where[key] = value;
            } else if (
               typeof value === "object" &&
               "min" in value &&
               "max" in value
            ) {
               where[key] = {
                  gte: value.min,
                  lte: value.max,
               };
            } else if (typeof value === "number") {
               where[key] = value;
            }
         }
      }

      return where;
   }
}
