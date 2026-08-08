import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      workspaceId: string;
      role: UserRole;
      avatar?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    workspaceId: string;
    role: UserRole;
    avatar?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    workspaceId?: string;
    role?: UserRole;
    avatar?: string | null;
  }
}
