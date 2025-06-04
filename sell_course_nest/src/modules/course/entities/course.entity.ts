import { Category } from 'src/modules/category/entities/category.entity';
import { Interaction } from 'src/modules/Interaction/entities/Interaction.entity';
import { Notify } from 'src/modules/notify/entities/notify.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Waitlist } from 'src/modules/waitlist/entities/waitlist.entity';
import { Promotion } from 'src/modules/promotion/entities/promotion.entity';
import { Certificate } from 'src/modules/certificate/entities/certificate.entity';
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('course')
export class Course {
  @PrimaryColumn({ type: 'uuid' })
  courseId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'instructor_id' })
  instructor: User;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', name: 'short_description' })
  shortDescription: string;

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'varchar', name: 'video_intro' })
  videoIntro: string;

  @Column({ type: 'varchar' })
  thumbnail: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'varchar' })
  skill: string;

  @Column({ type: 'varchar' })
  level: string;

  @Column({ type: 'boolean' })
  status: boolean;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Interaction, (interaction) => interaction.course)
  interactions: Interaction[];

  @OneToMany(() => Notify, (notify) => notify.course)
  notifies: Notify[];

  @OneToMany(() => Waitlist, (waitlist) => waitlist.user)
  waitlists: Waitlist[];

  @OneToMany(() => Promotion, (promotion) => promotion.course)
  promotions: Promotion[];

  @OneToMany(() => Certificate, (certificate) => certificate.course)
  certificates: Certificate[];

  @BeforeInsert()
  prePersist() {
    if (!this.courseId) {
      this.courseId = uuidv4();
    }
  }
}
