export interface Permission {
  id: number;
  name: string;
  code: string;
}

export interface User {
  user_id: string;
  email: string | null;
  username: string | null;
  avatarImg: string | null;
  gender: string;
  birthDay: string | null;
  phoneNumber: string;
  role: string;
  isBan: boolean;
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
  user_id: null;
  email: undefined;
  username: null;
  avatarImg: null;
  gender: null;
  birthDay: null;
  phoneNumber: string;
  role: string;
}

export interface UserGetAllWishlist {
  user_id: string;
  wishlistId: string;
  course: {
    courseId: string;
    imageInfo?: string;
    title: string;
    categoryName?: string;
    description: string;
  };
}
