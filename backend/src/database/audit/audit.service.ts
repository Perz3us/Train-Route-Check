import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogEntry {
  userId?: string;
  action: string;
  tableName: string;
  recordId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async logAction(entry: AuditLogEntry) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          tableName: entry.tableName,
          recordId: entry.recordId,
          oldValues: entry.oldValues ? JSON.stringify(entry.oldValues) : undefined,
          newValues: entry.newValues ? JSON.stringify(entry.newValues) : undefined,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
        },
      });
      
      this.logger.log(`Audit log entry created for action: ${entry.action} on table: ${entry.tableName}`);
    } catch (error) {
      this.logger.error(`Failed to create audit log entry: ${error.message}`);
    }
  }

  async getAuditLogs(options?: {
    userId?: string;
    action?: string;
    tableName?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const where: any = {};
      
      if (options?.userId) {
        where.userId = options.userId;
      }
      
      if (options?.action) {
        where.action = options.action;
      }
      
      if (options?.tableName) {
        where.tableName = options.tableName;
      }
      
      const logs = await this.prisma.auditLog.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      });
      
      return logs.map(log => ({
        ...log,
        oldValues: log.oldValues ? JSON.parse(log.oldValues) : null,
        newValues: log.newValues ? JSON.parse(log.newValues) : null,
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch audit logs: ${error.message}`);
      throw error;
    }
  }

  async getAuditLogById(id: string) {
    try {
      const log = await this.prisma.auditLog.findUnique({
        where: { id },
      });
      
      if (!log) {
        return null;
      }
      
      return {
        ...log,
        oldValues: log.oldValues ? JSON.parse(log.oldValues) : null,
        newValues: log.newValues ? JSON.parse(log.newValues) : null,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch audit log by ID: ${error.message}`);
      throw error;
    }
  }
}