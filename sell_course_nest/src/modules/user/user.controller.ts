import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  async getAll() {
    return this.userService.getAllUser();
  }
}
