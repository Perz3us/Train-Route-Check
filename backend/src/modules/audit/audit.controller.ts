import {
  Controller,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { AuditService } from '../../database/audit/audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async getAuditLogs(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('tableName') tableName?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return await this.auditService.getAuditLogs({
      userId,
      action,
      tableName,
      limit,
      offset,
    });
  }

  @Get(':id')
  async getAuditLogById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.auditService.getAuditLogById(id);
  }
}