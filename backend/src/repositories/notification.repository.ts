import { Notification } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { PaginationParams } from './user.repository';

export interface CreateNotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: string;
}

export interface UpdateNotificationData {
  isRead?: boolean;
  metadata?: string;
}

export interface NotificationQueryParams extends PaginationParams {
  userId?: string;
  type?: string;
  isRead?: boolean;
  fromDate?: Date;
  toDate?: Date;
}

export class NotificationRepository extends BaseRepository {
  async create(data: CreateNotificationData): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata,
        isRead: false
      }
    });
  }

  async findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({
      where: { id }
    });
  }

  async update(id: string, data: UpdateNotificationData): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<Notification> {
    return this.prisma.notification.delete({
      where: { id }
    });
  }

  async findByUser(userId: string, params?: NotificationQueryParams): Promise<Notification[]> {
    const { 
      page = 1, 
      limit = 10,
      type,
      isRead,
      fromDate,
      toDate
    } = params || {};
    
    const skip = (page - 1) * limit;
    
    const where: any = { userId };
    
    if (type) where.type = type;
    if (isRead !== undefined) where.isRead = isRead;
    
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = fromDate;
      if (toDate) where.createdAt.lte = toDate;
    }

    return this.prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  async findAll(params?: NotificationQueryParams): Promise<Notification[]> {
    const { 
      page = 1, 
      limit = 10,
      userId,
      type,
      isRead,
      fromDate,
      toDate
    } = params || {};
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (isRead !== undefined) where.isRead = isRead;
    
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = fromDate;
      if (toDate) where.createdAt.lte = toDate;
    }

    return this.prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  async markAsRead(notificationIds: string[]): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        id: { in: notificationIds }
      },
      data: { isRead: true }
    });
    
    return result.count;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: { isRead: true }
    });
    
    return result.count;
  }

  async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });
  }

  async countByType(userId: string, type?: string): Promise<number> {
    const where: any = { userId };
    if (type) where.type = type;
    
    return this.prisma.notification.count({ where });
  }

  async createAppointmentNotification(
    userId: string,
    type: string,
    appointmentId: string,
    date: Date
  ): Promise<Notification> {
    let title = '';
    let message = '';
    
    switch (type) {
      case 'APPOINTMENT_BOOKED':
        title = 'Appointment Booked';
        message = `Your appointment has been booked for ${date.toLocaleDateString()}`;
        break;
      case 'APPOINTMENT_CONFIRMED':
        title = 'Appointment Confirmed';
        message = `Your appointment has been confirmed for ${date.toLocaleDateString()}`;
        break;
      case 'APPOINTMENT_CANCELLED':
        title = 'Appointment Cancelled';
        message = `Your appointment has been cancelled`;
        break;
      case 'APPOINTMENT_REMINDER':
        title = 'Appointment Reminder';
        message = `You have an appointment tomorrow at ${date.toLocaleTimeString()}`;
        break;
      default:
        title = 'Appointment Update';
        message = 'Your appointment status has been updated';
    }
    
    return this.create({
      userId,
      type,
      title,
      message,
      metadata: JSON.stringify({
        appointmentId,
        date: date.toISOString(),
        type
      })
    });
  }
}