import type { NextAuthConfig } from "next-auth";

// Edge-safe half of the auth setup (no DB access) — shared by middleware and lib/auth.ts.
export const authConfig = {
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.phone = (user as any).phone;
        token.city = (user as any).city;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).phone = token.phone;
        (session.user as any).city = token.city;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
