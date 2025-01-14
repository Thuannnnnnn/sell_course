import { Course } from 'src/modules/course/entities/course.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity('category')
export class Category {
  @PrimaryColumn({ name: 'category_id' })
  categoryId: string;

  @Column({ name: 'category_name ' })
  name: string;

  @Column({ name: 'category_description', nullable: true })
  description: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @OneToMany(() => Course, (course) => course.category)
  courses: Course[];
}
