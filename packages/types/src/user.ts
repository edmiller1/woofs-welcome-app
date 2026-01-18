import { UserNotificationPreferences } from "./notification";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string;
  provider: string;
  activeContext: string;
  isAdmin: boolean;
  activeBusinessId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  notificationPreferences: UserNotificationPreferences;
}
