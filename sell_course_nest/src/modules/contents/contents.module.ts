import { ContentController } from './contents.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contents } from './entities/contents.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { ContentService } from './contents.service';

@Module({
  imports: [TypeOrmModule.forFeature([Contents, Lesson])],
  controllers: [ContentController],
  providers: [ContentService],
})
export class ContentModule {}
