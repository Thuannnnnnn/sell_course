import { User } from '../../user/entities/user.entity';
import { Course } from '../../course/entities/course.entity';

export class CartResponseDto {
  cartId: string;
  user: User;
  course: Course;
}
