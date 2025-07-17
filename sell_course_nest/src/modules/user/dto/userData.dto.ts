export class PermissionDTO {
  id: number;
  name: string;
  code: string;

  constructor(permission: { id: number; name: string; code: string }) {
    this.id = permission.id;
    this.name = permission.name;
    this.code = permission.code;
  }
}

export class UserDTO {
  user_id: string;
  email: string;
  username: string;
  avatarImg: string | null;
  gender: string;
  birthDay: string | null;
  phoneNumber: string;
  role: string;
  isBan: boolean;
  permissions: PermissionDTO[];

  constructor(user: {
    user_id: string;
    email: string;
    username: string;
    avatarImg: string | null;
    gender: string;
    birthDay: string | null;
    phoneNumber: string;
    role: string;
    isBan: boolean;
    permissions: {
      id: number;
      name: string;
      code: string;
    }[];
  }) {
    this.user_id = user.user_id;
    this.email = user.email;
    this.username = user.username;
    this.avatarImg = user.avatarImg;
    this.gender = user.gender;
    this.birthDay = user.birthDay;
    this.phoneNumber = user.phoneNumber;
    this.role = user.role;
    this.isBan = user.isBan;
    this.permissions = user.permissions.map(
      (permission) => new PermissionDTO(permission),
    );
  }
}
