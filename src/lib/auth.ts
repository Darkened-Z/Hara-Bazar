import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;

        const phone = (credentials.phone as string).replace(/[\s-]/g, "");
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.phone, phone))
          .limit(1);

        if (!user) return null;

        const valid = await compare(credentials.password as string, user.passwordHash);
        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          city: user.city,
        };
      },
    }),
  ],
});
