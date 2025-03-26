import { Course } from "../course/Course";
import { UserNotify } from "./User_notify";

export interface Notify {
  notifyId?: string;
  title: string;
  message: string;
  type: "GLOBAL" | "USER" | "COURSE" | "ADMIN";
  isGlobal?: boolean;
  createdAt?: Date;
  userNotifies?: UserNotify[];
  courseId: string;
  userId?: string | null;
  course?: Course;
}
