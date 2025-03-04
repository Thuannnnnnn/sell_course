import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Forum } from './entities/forum.entity';
import { ForumService } from './forum.service';
import { ForumController } from './forum.controller';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Forum, User])],
  controllers: [ForumController],
  providers: [ForumService],
})
export class ForumModule {}
