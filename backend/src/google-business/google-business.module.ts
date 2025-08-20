import { Module } from '@nestjs/common';
import { GoogleBusinessController } from './google-business.controller';
import { GoogleBusinessService } from './google-business.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [GoogleBusinessController],
  providers: [GoogleBusinessService],
  exports: [GoogleBusinessService],
})
export class GoogleBusinessModule {}
