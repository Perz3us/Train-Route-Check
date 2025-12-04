import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
  async onModuleInit() {
    const url = process.env.DATABASE_URL;
    if (url) {
      console.log('Prisma connecting to:', url.replace(/:[^:@]*@/, ':****@'));
    } else {
      console.error('DATABASE_URL is not defined');
    }
    await this.$connect();
    console.log('Db connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Db disconnected');
  }
}
