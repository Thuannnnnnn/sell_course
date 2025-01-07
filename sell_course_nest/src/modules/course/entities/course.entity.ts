import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('course')
export class Course {
  @PrimaryColumn({ name: 'courseId' })
  courseId: string;

  @Column()
  title: string;

  @Column({ type: 'double precision' })
  price: number;

  @Column()
  description: string;

  @Column({ name: 'video_info' })
  videoInfo: string;

  @Column({ name: 'image_info' })
  imageInfo: string;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
