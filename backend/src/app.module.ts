import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration], // Use our configuration function
      isGlobal: true, // Make config available everywhere
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
