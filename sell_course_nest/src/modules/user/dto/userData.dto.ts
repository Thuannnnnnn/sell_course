export class UserDto {
  constructor(
    public user_id: string,
    public email: string,
    public username: string,
    public gender: string,
    public avartaImg: string,
    public birthDay: string,
    public phoneNumber: number,
    public role: string,
  ) {
    this.user_id = user_id;
  }
  // static fromEntity(user: User): UserDto {
  //   return new UserDto(
  //     user.email,
  //     user.username,
  //     user.gender || null,
  //     user.birthDay || null,
  //     user.phoneNumber || null,
  //     user.role,
  //     user.user_id,
  //   );
  // }
}
