import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      avatarImg?: string;
      gender?: string;
      birthDay?: string;
      phoneNumber?: string;
      role?: string;
    };
    accessToken?: string;
    expires: string;
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
    token?: string;
    avatarImg?: string;
    gender?: string;
    birthDay?: string;
    phoneNumber?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken?: string;
    avatarImg?: string;
    gender?: string;
    birthDay?: string;
    phoneNumber?: string;
    role?: string;
  }
}
