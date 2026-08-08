import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models";
import { verifyPassword } from "./password";
import { loginSchema } from "@/lib/validations/auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        await connectDB();
        const user = await User.findOne({
          email: parsed.data.email.toLowerCase(),
        });
        if (!user) return null;

        const valid = await verifyPassword(
          parsed.data.password,
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          workspaceId: user.workspaceId.toString(),
          role: user.role,
          avatar: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.workspaceId = user.workspaceId;
        token.role = user.role;
        token.avatar = user.avatar;
      }

      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.avatar !== undefined) token.avatar = session.avatar;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.workspaceId = token.workspaceId as string;
        session.user.role = token.role as "OWNER" | "ADMIN" | "MEMBER";
        session.user.avatar = (token.avatar as string | null) ?? null;
      }
      return session;
    },
  },
};
