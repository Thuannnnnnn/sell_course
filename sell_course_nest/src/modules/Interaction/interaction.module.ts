import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../course/entities/course.entity';
import { Interaction } from './entities/Interaction.entity';
import { User } from '../user/entities/user.entity';
import { InteractionController } from './Interaction.controller';
import { InteractionService } from './Interaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([Interaction, Course, User])],
  controllers: [InteractionController],
  providers: [InteractionService],
  exports: [InteractionService],
})
export class InteractionModule {}
