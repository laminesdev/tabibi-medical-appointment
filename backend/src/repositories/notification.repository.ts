import { Notification, Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export interface CreateNotificationData {
   userId: string;
   type: string;
   title: string;
   message: string;
   metadata?: any;
}

export interface NotificationQueryParams {
   userId?: string;
   type?: string;
   isRead?: boolean;
   page?: number;
   limit?: number;
}

export class NotificationRepository extends BaseRepository {
   async create(data: CreateNotificationData): Promise<Notification> {
      return this.prisma.notification.create({
         data: {
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            metadata: data.metadata ? JSON.stringify(data.metadata) : null,
            isRead: false,
         },
      });
   }

   async findById(id: string): Promise<Notification | null> {
      return this.prisma.notification.findUnique({
         where: { id },
      });
   }

   async update(
      id: string,
      data: Partial<Notification>
   ): Promise<Notification> {
      return this.prisma.notification.update({
         where: { id },
         data,
      });
   }

   async markAsRead(id: string): Promise<Notification> {
      return this.prisma.notification.update({
         where: { id },
         data: { isRead: true },
      });
   }

   async markAllAsRead(userId: string): Promise<void> {
      await this.prisma.notification.updateMany({
         where: { userId, isRead: false },
         data: { isRead: true },
      });
   }

   async delete(id: string): Promise<Notification> {
      return this.prisma.notification.delete({
         where: { id },
      });
   }

   async findAll(params: NotificationQueryParams): Promise<Notification[]> {
      const { userId, type, isRead, page = 1, limit = 20 } = params;
      const { skip, take } = this.getPaginationParams(page, limit);

      const where: Prisma.NotificationWhereInput = {};

      if (userId) where.userId = userId;
      if (type) where.type = type;
      if (isRead !== undefined) where.isRead = isRead;

      return this.prisma.notification.findMany({
         where,
         skip,
         take,
         orderBy: { createdAt: "desc" },
      });
   }

   async count(params?: Partial<NotificationQueryParams>): Promise<number> {
      const { userId, type, isRead } = params || {};

      const where: Prisma.NotificationWhereInput = {};

      if (userId) where.userId = userId;
      if (type) where.type = type;
      if (isRead !== undefined) where.isRead = isRead;

      return this.prisma.notification.count({ where });
   }

   async getUnreadCount(userId: string): Promise<number> {
      return this.prisma.notification.count({
         where: { userId, isRead: false },
      });
   }

   async deleteOldNotifications(days: number = 30): Promise<void> {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      await this.prisma.notification.deleteMany({
         where: {
            createdAt: { lt: cutoffDate },
         },
      });
   }
}
