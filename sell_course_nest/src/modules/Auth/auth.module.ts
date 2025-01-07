import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { authService } from './auth.service';
import { authController } from './auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [authService],
  controllers: [authController],
})
export class authModule {}
