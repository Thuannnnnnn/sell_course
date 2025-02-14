import { Category } from 'src/modules/category/entities/category.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('course')
export class Course {
  @PrimaryColumn({ name: 'courseId' })
  courseId: string;

  @Column()
  title: string;

  @Column({ type: 'double precision' })
  price: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  description: string;

  @Column({ name: 'video_info' })
  videoInfo: string;

  @Column({ name: 'image_info' })
  imageInfo: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'update_at', type: 'timestamp' })
  updatedAt: Date;

  @BeforeInsert()
  prePersist() {
    if (!this.courseId) {
      this.courseId = uuidv4();
    }
  }
}
