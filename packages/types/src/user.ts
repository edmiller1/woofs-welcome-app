import type { UserNotificationPreferences } from "./notification";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  profileImageId: string | null;
  provider: string;
  activeContext: string;
  isAdmin: boolean;
  activeBusinessId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  notificationPreferences: UserNotificationPreferences;
}

export interface BAUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  profileImageId: string | null;
  altText: string;
  isAdmin: boolean;
  activeContext: "business" | "personal";
  createdAt: string;
  updatedAt: string;
}
