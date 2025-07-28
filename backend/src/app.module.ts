import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from './config/configuration';
import { PrismaModule } from './database/prisma/prisma.module';
import { StationsModule } from './modules/stations/stations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath: '.env',
    }),
    StationsModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
