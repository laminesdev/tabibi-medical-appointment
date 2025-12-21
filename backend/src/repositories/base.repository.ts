import { PrismaClient } from "@prisma/client";

export abstract class BaseRepository {
   protected prisma: PrismaClient;

   constructor(prisma?: PrismaClient) {
      this.prisma = prisma || new PrismaClient();
   }

   getPrisma(): PrismaClient {
      return this.prisma;
   }

   async transaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
      return this.prisma.$transaction(async (tx) => {
         return fn(tx as PrismaClient);
      });
   }

   async disconnect(): Promise<void> {
      await this.prisma.$disconnect();
   }

   async connect(): Promise<void> {
      await this.prisma.$connect();
   }
}
