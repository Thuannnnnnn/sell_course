export class UserDto {
  constructor(
    public email: string,
    public username: string,
    public gender: string,
    public birthDay: string,
    public phoneNumber: number,
    public role: string,
  ) {}
}
