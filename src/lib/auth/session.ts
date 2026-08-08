import { auth } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/api/errors";
import type { SessionUser } from "@/types";

export async function requireSession(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id || !session.user.workspaceId) {
    throw new UnauthorizedError();
  }

  return {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    workspaceId: session.user.workspaceId,
    role: session.user.role,
    avatar: session.user.avatar,
  };
}

export async function getOptionalSession(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.workspaceId) return null;
  return {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    workspaceId: session.user.workspaceId,
    role: session.user.role,
    avatar: session.user.avatar,
  };
}
