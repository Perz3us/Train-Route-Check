import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { Logger } from '@nestjs/common';

// Mock PrismaService directly
const mockPrismaService = {
  auditLog: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
} as any; // Use 'any' for simpler mocking of extended classes

describe('AuditService', () => {
  let service: AuditService;
  let prisma: typeof mockPrismaService; // Use typeof mockPrismaService for type safety

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logAction', () => {
    it('should create an audit log entry', async () => {
      const entry = {
        action: 'CREATE',
        tableName: 'users',
        recordId: '123',
        newValues: { name: 'test' },
      };
      (prisma.auditLog.create as jest.Mock).mockResolvedValue(entry);

      await service.logAction(entry);

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          userId: undefined,
          action: 'CREATE',
          tableName: 'users',
          recordId: '123',
          oldValues: undefined,
          newValues: JSON.stringify({ name: 'test' }),
          ipAddress: undefined,
          userAgent: undefined,
        },
      });
    });
  });

  describe('getAuditLogs', () => {
    it('should return audit logs', async () => {
      const logs = [
        {
          id: '1',
          action: 'CREATE',
          tableName: 'users',
          createdAt: new Date(),
          oldValues: JSON.stringify({ old: 'data' }),
          newValues: JSON.stringify({ new: 'data' }),
        },
      ];
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(logs);

      const result = await service.getAuditLogs();

      expect(result).toEqual([
        {
          id: '1',
          action: 'CREATE',
          tableName: 'users',
          createdAt: logs[0].createdAt,
          oldValues: { old: 'data' },
          newValues: { new: 'data' },
        },
      ]);
    });
  });

  describe('getAuditLogById', () => {
    it('should return an audit log by ID', async () => {
      const log = {
        id: '1',
        action: 'CREATE',
        tableName: 'users',
        createdAt: new Date(),
        oldValues: JSON.stringify({ old: 'data' }),
        newValues: JSON.stringify({ new: 'data' }),
      };
      (prisma.auditLog.findUnique as jest.Mock).mockResolvedValue(log);

      const result = await service.getAuditLogById('1');

      expect(result).toEqual({
        id: '1',
        action: 'CREATE',
        tableName: 'users',
        createdAt: log.createdAt,
        oldValues: { old: 'data' },
        newValues: { new: 'data' },
      });
    });

    it('should return null if audit log not found', async () => {
      (prisma.auditLog.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.getAuditLogById('1');

      expect(result).toBeNull();
    });
  });
});