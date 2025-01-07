import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Lesson } from '../../lesson/entities/lesson.entity';
import { Video } from '../../video/entities/video.entity';
import { Docs } from '../../docs/entities/docs.entity';

@Entity('contents')
export class Contents {
  @PrimaryColumn({ name: 'content_id' })
  contentId: string;

  @ManyToOne(() => Lesson)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @OneToMany(() => Video, (video) => video.contents, {
    cascade: true,
    eager: true,
  })
  video: Video[];

  @OneToMany(() => Docs, (docs) => docs.contents, {
    cascade: true,
    eager: true,
  })
  docs: Docs[];
}
