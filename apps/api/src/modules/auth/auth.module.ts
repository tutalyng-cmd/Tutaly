import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailService } from './mail.service';
import { TokenService } from './token.service';
import { User } from '../user/entities/user.entity';
import { SeekerProfile } from '../user/entities/seeker-profile.entity';
import { EmployerProfile } from '../user/entities/employer-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, SeekerProfile, EmployerProfile]),
    JwtModule.register({}), // Secrets are passed per-sign call
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, TokenService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
