import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
          include: {
            subscription: true,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isMatch) {
          throw new Error("Invalid credentials");
        }
          // user Must have Subscription
      if (user.role === "USER") {
       if (!user.subscription || !user.subscription.isActive) {
       throw new Error("No active subscription");
       }
             }  

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as { role?: string }).role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        (session.user as { role?: string }).role = token.role as string;
      }

      return session;
    },
  },

  pages: {
    signIn: "/signin",
    signOut: "/signout",
    error: "/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
});