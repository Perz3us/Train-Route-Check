import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StationsModule } from './stations/stations.module';
import configuration from './config/configuration';
import { PrismaModule } from './database/prisma/prisma.module';

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
