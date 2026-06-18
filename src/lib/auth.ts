import NextAuth, { DefaultSession } from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & { id: string; isAdmin: boolean };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ user }) {
      const allowed = await prisma.allowedEmail.findUnique({
        where: { email: user.email ?? '' },
      });
      return !!allowed;
    },
    session({ session, user }) {
      session.user.id = user.id;
      (session.user as typeof session.user & { isAdmin: boolean }).isAdmin =
        (user as typeof user & { isAdmin: boolean }).isAdmin ?? false;
      return session;
    },
  },
});
