import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { loginSchema } from './validation';
import type { Role } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: Role;
      emailVerified: Date | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    role: Role;
    emailVerified: Date | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    emailVerified: Date | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        // Validate input
        const validated = loginSchema.safeParse(credentials);
        if (!validated.success) {
          throw new Error('Invalid credentials');
        }

        const { email, password } = validated.data;

        // Rate limiting check
        const ipAddress = req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'] || 'unknown';
        const recentAttempts = await prisma.loginAttempt.count({
          where: {
            email,
            success: false,
            createdAt: {
              gte: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
            },
          },
        });

        if (recentAttempts >= 5) {
          throw new Error('Too many failed login attempts. Please try again later.');
        }

        // Find user
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            emailVerified: true,
            isActive: true,
          },
        });

        const success = user && user.password && (await bcrypt.compare(password, user.password));

        // Log attempt
        await prisma.loginAttempt.create({
          data: {
            email,
            ipAddress: String(ipAddress),
            userAgent: req.headers?.['user-agent'] || null,
            success: !!success,
            userId: user?.id,
          },
        });

        if (!success) {
          throw new Error('Invalid email or password');
        }

        if (!user.isActive) {
          throw new Error('Account has been deactivated');
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
        };
      },
    }),
    // Google OAuth provider (optional)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/welcome',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.emailVerified = token.emailVerified;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Allow OAuth without email verification
      if (account?.provider !== 'credentials') {
        return true;
      }

      // For credentials, check email verification if enabled
      if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true' && !user.emailVerified) {
        return '/auth/verify-request?provider=credentials';
      }

      return true;
    },
  },
  events: {
    async signIn({ user }) {
      // Additional security logging
      // User ${user.email} signed in at ${new Date().toISOString()}
    },
    async signOut({ session }) {
      if (session?.user?.email) {
        // User ${session.user.email} signed out at ${new Date().toISOString()}
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
};