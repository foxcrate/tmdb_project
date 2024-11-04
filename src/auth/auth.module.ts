import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { AuthGuard } from './auth-guard';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [UserModule],
  exports: [AuthService],
})
export class AuthModule {}
