import { Category } from 'src/modules/category/entities/category.entity';
import { Notify } from 'src/modules/notify/entities/notify.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Waitlist } from 'src/modules/waitlist/entities/waitlist.entity';
import { Promotion } from 'src/modules/promotion/entities/promotion.entity';
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
import { Certificate } from 'src/modules/certificate/entities/certificate.entity';

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

  @Column({ name: 'is_public', type: 'boolean', default: true })
  isPublic: boolean;
  @OneToMany(() => Notify, (notify) => notify.course)
  notifies: Notify[];
  @BeforeInsert()
  prePersist() {
    if (!this.courseId) {
      this.courseId = uuidv4();
    }
  }

  @OneToMany(() => Waitlist, (waitlist) => waitlist.user)
  waitlists: Waitlist[];

  @OneToMany(() => Promotion, (promotion) => promotion.course)
  promotions: Promotion[];

  @OneToMany(() => Certificate, (certificate) => certificate.course)
  certificates: Certificate[];
}
