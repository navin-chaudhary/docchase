import { connectDB } from "@/lib/db/connect";
import { Workspace, User } from "@/models";
import { NotFoundError } from "@/lib/api/errors";
import type { WorkspaceUpdateInput } from "@/lib/validations/workspace";
import type { ProfileUpdateInput } from "@/lib/validations/auth";

export async function getWorkspace(workspaceId: string) {
  await connectDB();
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new NotFoundError("Workspace not found");
  return workspace;
}

export async function updateWorkspace(
  workspaceId: string,
  input: WorkspaceUpdateInput
) {
  await connectDB();
  const workspace = await Workspace.findOneAndUpdate(
    { _id: workspaceId },
    { $set: input },
    { new: true }
  );
  if (!workspace) throw new NotFoundError("Workspace not found");
  return workspace;
}

export async function updateProfile(
  userId: string,
  workspaceId: string,
  input: ProfileUpdateInput
) {
  await connectDB();
  const user = await User.findOneAndUpdate(
    { _id: userId, workspaceId },
    { $set: input },
    { new: true }
  ).select("-passwordHash -resetPasswordToken -resetPasswordExpires");

  if (!user) throw new NotFoundError("User not found");
  return user;
}
