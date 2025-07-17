import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocsService } from './docs.service';
import { Contents } from '../contents/entities/contents.entity';
import { Docs } from './entities/docs.entity';
import { DocsController } from './docs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Docs, Contents])],

  providers: [DocsService],
  controllers: [DocsController],
})
export class DocsModule {}
