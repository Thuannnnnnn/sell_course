import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Qa } from './entities/qa.entity';
import { QaService } from './qa.service';
import { QaController } from './qa.controller';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { CourseModule } from '../course/course.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Qa, User, Course]),
    UserModule,
    CourseModule,
  ],
  providers: [QaService],
  controllers: [QaController],
})
export class QaModule {}
