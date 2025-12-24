import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";

// Singleton Prisma client to avoid multiple connections
let prismaClient: PrismaClient | null = null;

const getPrismaClient = (): PrismaClient => {
   if (!prismaClient) {
      prismaClient = new PrismaClient({
         log:
            process.env.NODE_ENV === "development"
               ? ["query", "info", "warn", "error"]
               : ["error"],
      });
   }
   return prismaClient;
};

export class BaseRepository {
   protected prisma: PrismaClient;

   constructor(prisma?: PrismaClient) {
      this.prisma = prisma || getPrismaClient();
   }

   getPrisma(): PrismaClient {
      return this.prisma;
   }

   async transaction<T>(
      fn: (transactionClient: Prisma.TransactionClient) => Promise<T>
   ): Promise<T> {
      return await this.prisma.$transaction(fn);
   }

   static async disconnectAll(): Promise<void> {
      if (prismaClient) {
         await prismaClient.$disconnect();
         prismaClient = null;
      }
   }

   async disconnect(): Promise<void> {
      if (this.prisma !== prismaClient) {
         await this.prisma.$disconnect();
      }
   }

   async connect(): Promise<void> {
      await this.prisma.$connect();
   }

   protected getPaginationParams(
      page?: number,
      limit?: number
   ): {
      skip: number;
      take: number;
   } {
      const validPage = page && page > 0 ? page : 1;
      const validLimit = limit && limit > 0 && limit <= 100 ? limit : 10;
      return {
         skip: (validPage - 1) * validLimit,
         take: validLimit,
      };
   }

   // FIXED: Use local time consistently for single timezone
   protected getDateRangeCondition(date?: Date): {
      gte?: Date;
      lte?: Date;
   } {
      if (!date) return {};

      // Use local time for single timezone project
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      return {
         gte: startOfDay,
         lte: endOfDay,
      };
   }
}

// Export a cleanup function for testing
export const cleanupDatabase = async (): Promise<void> => {
   await BaseRepository.disconnectAll();
};
