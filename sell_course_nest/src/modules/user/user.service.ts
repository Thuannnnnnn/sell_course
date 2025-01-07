import { Injectable } from '@nestjs/common';
import { UserDto } from './dto/userData.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async getAllUser(): Promise<UserDto[]> {
    const users = await this.userRepository.find();
    return users.map((user) => {
      return new UserDto(
        user.email,
        user.username,
        user.gender,
        user.birthDay,
        user.phoneNumber,
        user.role,
      );
    });
  }
}
