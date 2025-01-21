export class UserDto {
  constructor(
    public email: string,
    public username: string,
    public gender: string,
    public birthDay: string,
    public phoneNumber: number,
    public role: string,
  ) {}

  static fromEntity(user: any): UserDto {
    return new UserDto(
      user.email,
      user.username,
      user.gender || null,
      user.birthDay || null,
      user.phoneNumber || null,
      user.role,
    );
  }
}
