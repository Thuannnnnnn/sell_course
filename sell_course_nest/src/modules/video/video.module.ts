import { Module } from '@nestjs/common';
import { Video } from './entities/video.entity';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contents } from '../contents/entities/contents.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Video, Contents])],
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}
