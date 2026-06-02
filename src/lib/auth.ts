import NextAuth from "next-auth";
import Instagram from "next-auth/providers/instagram";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Instagram({
      clientId: process.env.AUTH_INSTAGRAM_ID!,
      clientSecret: process.env.AUTH_INSTAGRAM_SECRET!,
    }),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user?.password) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      // OAuth経由の場合のみCustomerを自動作成（Credentials除外）
      if (account?.provider !== "credentials" && user.id) {
        const existing = await prisma.customer.findUnique({ where: { userId: user.id } });
        if (!existing) {
          await prisma.customer.create({
            data: { userId: user.id, tier: "bronze", totalPoints: 0 },
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
  pages: { signIn: "/" },
});
