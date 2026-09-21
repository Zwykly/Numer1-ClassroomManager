import { type Session, type User } from "better-auth";

export type userData = {
    session: Session;
    user: myUser;
};

export type myUser = User & {
    userInfo?: UserInfo | null;
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    displayUsername?: string | null;
};
export interface UserInfo {
  id: string;
  authId: string;
  firstName: string;
  lastName: string;
  email: string;
  additionalInfo: string | null;
  role: string;
  color?: string | null;
  onlineClassroom?: {
    id: string;
    name: string;
    teacherId: string;
    comment?: string | null;
    status?: string;
  } | null;
}