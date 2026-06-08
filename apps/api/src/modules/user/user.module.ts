import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserSettingsController } from './controllers/user-settings.controller';
import { UserService } from './user.service';
import { AccountSettingsService } from './services/account-settings.service';
import { User } from './entities/user.entity';
import { SeekerProfile } from './entities/seeker-profile.entity';
import { EmployerProfile } from './entities/employer-profile.entity';
import { UserSettings } from './entities/user-settings.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, SeekerProfile, EmployerProfile, UserSettings]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController, UserSettingsController],
  providers: [UserService, AccountSettingsService],
  exports: [UserService, TypeOrmModule, AccountSettingsService],
})
export class UserModule {}
