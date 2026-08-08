import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { User, Workspace, DocumentTemplate } from "@/models";
import { hashPassword } from "@/lib/auth/password";
import { uniqueSlug } from "@/lib/utils/slug";
import { generateResetToken } from "@/lib/utils/tokens";
import { sendEmail } from "@/lib/email/client";
import { passwordResetEmail } from "@/lib/email/templates";
import { AppError, NotFoundError, ValidationError } from "@/lib/api/errors";
import type { RegisterInput } from "@/lib/validations/auth";

const DEFAULT_TEMPLATES = [
  {
    name: "ITR Filing",
    description: "Documents required for individual ITR filing",
    documents: [
      { name: "PAN Card", description: "Clear copy of PAN", required: true },
      { name: "Aadhaar Card", description: "Front and back", required: true },
      {
        name: "Bank Statement",
        description: "Last financial year",
        required: true,
      },
      { name: "Form 16", description: "From employer if applicable", required: false },
      {
        name: "Investment Proof",
        description: "80C / other investments",
        required: false,
      },
      { name: "Previous ITR", description: "Last year's ITR acknowledgement", required: false },
    ],
  },
  {
    name: "KYC",
    description: "Standard KYC document checklist",
    documents: [
      { name: "PAN Card", description: "", required: true },
      { name: "Aadhaar Card", description: "", required: true },
      { name: "Passport Photo", description: "Recent photo", required: true },
      { name: "Address Proof", description: "", required: true },
    ],
  },
  {
    name: "Loan Application",
    description: "Common loan application documents",
    documents: [
      { name: "PAN Card", description: "", required: true },
      { name: "Aadhaar Card", description: "", required: true },
      { name: "Salary Slips", description: "Last 3 months", required: true },
      { name: "Bank Statement", description: "Last 6 months", required: true },
      { name: "Form 16", description: "", required: false },
    ],
  },
];

export async function registerUser(input: RegisterInput) {
  await connectDB();

  const existing = await User.findOne({
    email: input.email.toLowerCase(),
  });
  if (existing) {
    throw new ValidationError("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const slug = uniqueSlug(input.companyName);
  const workspaceId = new mongoose.Types.ObjectId();
  const userId = new mongoose.Types.ObjectId();

  // Avoid multi-document transactions — they require a replica set
  // (local standalone MongoDB does not support them).
  try {
    await Workspace.create({
      _id: workspaceId,
      name: input.companyName,
      slug,
      email: input.email.toLowerCase(),
      phone: input.phone ?? "",
      ownerId: userId,
      plan: "FREE",
    });

    const user = await User.create({
      _id: userId,
      workspaceId,
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      phone: input.phone ?? "",
      role: "OWNER",
    });

    await DocumentTemplate.insertMany(
      DEFAULT_TEMPLATES.map((t) => ({
        ...t,
        workspaceId,
        createdBy: userId,
      }))
    );

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      workspaceId: workspaceId.toString(),
    };
  } catch (err) {
    await Promise.allSettled([
      DocumentTemplate.deleteMany({ workspaceId }),
      User.deleteOne({ _id: userId }),
      Workspace.deleteOne({ _id: workspaceId }),
    ]);
    throw err;
  }
}

export async function requestPasswordReset(email: string) {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() });

  // Always return success to avoid email enumeration
  if (!user) {
    return { ok: true };
  }

  const token = generateResetToken();
  user.resetPasswordToken = token;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${appUrl}/reset-password?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your DocChase password",
    html: passwordResetEmail({ name: user.name, link }),
  });

  return { ok: true };
}

export async function resetPassword(token: string, password: string) {
  await connectDB();
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError(
      "INVALID_TOKEN",
      "Reset link is invalid or has expired",
      400
    );
  }

  user.passwordHash = await hashPassword(password);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  return { ok: true };
}

export async function getProfile(userId: string, workspaceId: string) {
  await connectDB();
  const user = await User.findOne({
    _id: userId,
    workspaceId,
  }).select("-passwordHash -resetPasswordToken -resetPasswordExpires");

  if (!user) throw new NotFoundError("User not found");
  return user;
}
