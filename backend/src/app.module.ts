import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GoogleBusinessModule } from './google-business/google-business.module';
import { FacebookModule } from './facebook/facebook.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    AuthModule,
    GoogleBusinessModule,
    FacebookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
