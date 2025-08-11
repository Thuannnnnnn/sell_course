import { Entity, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';
import { Contents } from '../../contents/entities/contents.entity';

@Entity('video')
export class Video {
  @PrimaryColumn({ name: 'video_id' })
  videoId: string;

  @OneToOne(() => Contents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'content_id' })
  contents: Contents;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  url: string;

  @Column()
  urlScript: string;

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
