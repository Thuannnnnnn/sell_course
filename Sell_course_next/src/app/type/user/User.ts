export interface Permission {
  id: number;
  name: string;
  code: string;
}

export interface User {
  user_id: string;
  email: string;
  username: string;
  avatarImg: string | null;
  gender: string;
  birthDay: string | null;
  phoneNumber: string;
  role: string;
  permissions: Permission[];
}

export interface UserGetAllCoursePurchase {
  user_id: string;
  coursePurchaseId: string;
  courseId: string;
  title: string;
  categoryName: string;
  categoryId: string;
  imageInfo: string;
}

export interface GetUser {
  user_id: string;
  email: string;
  username: string;
  avatarImg: string | null;
  gender: string;
  birthDay: string | null;
  phoneNumber: string;
  role: string;
}

