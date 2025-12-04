import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import configuration from './config/configuration';
import { PrismaModule } from './database/prisma/prisma.module';
import { StationsModule } from './modules/stations/stations.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { RoutesModule } from './modules/routes/routes.module';
import { AuthModule } from './modules/auth/auth.module';
import { LiveLocationsModule } from './modules/live-locations/live-locations.module';
import { EtaModule } from './modules/eta/eta.module';
import { SupabaseModule } from './database/supabase/supabase.module';
import { AuditModule as DatabaseAuditModule } from './database/audit/audit.module';
import { AuditModule } from './modules/audit/audit.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { TrainsModule } from './modules/trains/trains.module';
import { KafkaModule } from './modules/kafka/kafka.module';
import { IotModule } from './modules/iot/iot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath: '.env',
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        playground: configService.get('graphql.playground'),
        introspection: configService.get('graphql.introspection'),
        subscriptions: configService.get('graphql.subscriptions'),
        context: ({ req, res }) => ({ req, res }),
      }),
    }),
    PrismaModule,
    SupabaseModule,
    DatabaseAuditModule,
    StationsModule,
    RoutesModule,
    AuthModule,
    LiveLocationsModule,
    EtaModule,
    AuditModule,
    MetricsModule,
    RealtimeModule,
    AnalyticsModule,
    AnalyticsModule,
    TrainsModule,
    KafkaModule,
    IotModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
