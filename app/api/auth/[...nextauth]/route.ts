import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/app/_lib/prisma";
import NextAuth, { type NextAuthOptions, type Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.CLIENT_GOOGLE_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { subscriptionStatus: true },
        });
        token.subscriptionStatus = dbUser?.subscriptionStatus ?? null;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user.id = token.id as string;
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { subscriptionStatus: true },
        });
        session.user.subscriptionStatus = dbUser?.subscriptionStatus ?? null;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
