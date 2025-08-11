import { Entity, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';
import { Contents } from '../../contents/entities/contents.entity';

@Entity('docs')
export class Docs {
  @PrimaryColumn({ name: 'docs_id' })
  docsId: string;

  @OneToOne(() => Contents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'content_id' })
  contents: Contents;

  @Column()
  title: string;

  @Column()
  url: string;

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
