import { User } from "../user/User";
import { Notify } from "./Notify";

export interface UserNotify {
  id: string;
  user: User;
  notify: Notify;
  is_read: boolean;
  is_sent: boolean;
  read_at?: Date;
}
