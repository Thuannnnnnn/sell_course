import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class authService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.userRepository.create({
      user_id: uuidv4(),
      email: createUserDto.email,
      username: createUserDto.username,
      password: hashedPassword,
      gender: createUserDto.gender,
      birthDay: createUserDto.birthDay,
      phoneNumber: createUserDto.phoneNumber,
      role: createUserDto.role,
    });
    const savedUser = await this.userRepository.save(newUser);
    const userResponse: UserResponseDto = {
      user_id: savedUser.user_id,
      email: savedUser.email,
      username: savedUser.username,
      gender: savedUser.gender,
      birthDay: savedUser.birthDay,
      role: savedUser.role,
      createdAt: savedUser.createdAt.toISOString(),
    };

    return userResponse;
  }
}
