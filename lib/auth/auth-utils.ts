import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';
import { redirect } from 'next/navigation';
// For SQLite compatibility, we'll use string literals instead of enum
type Role = 'USER' | 'RESEARCHER' | 'ADMIN' | 'SUPER_ADMIN';

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Generate secure tokens
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Generate verification token
export async function generateVerificationToken(email: string, userId?: string): Promise<string> {
  const token = generateToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
      userId,
    },
  });

  return token;
}

// Generate password reset token
export async function generatePasswordResetToken(userId: string): Promise<string> {
  // Invalidate any existing tokens
  await prisma.passwordReset.updateMany({
    where: {
      userId,
      used: false,
      expires: { gt: new Date() },
    },
    data: { used: true },
  });

  const token = generateToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordReset.create({
    data: {
      userId,
      token,
      expires,
    },
  });

  return token;
}

// Verify token
export async function verifyToken(token: string, type: 'email' | 'password'): Promise<{
  valid: boolean;
  userId?: string;
  email?: string;
}> {
  if (type === 'email') {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return { valid: false };
    }

    // Mark email as verified
    if (verificationToken.userId) {
      await prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: new Date() },
      });
    }

    // Delete used token
    await prisma.verificationToken.delete({
      where: { token },
    });

    return {
      valid: true,
      userId: verificationToken.userId || undefined,
      email: verificationToken.identifier,
    };
  } else {
    const resetToken = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.used || resetToken.expires < new Date()) {
      return { valid: false };
    }

    return {
      valid: true,
      userId: resetToken.userId,
      email: resetToken.user.email,
    };
  }
}

// Get current user
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      institution: true,
      researchArea: true,
      bio: true,
      image: true,
      createdAt: true,
    },
  });

  return user;
}

// Require authentication
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/auth/login');
  }
  return session;
}

// Require specific role
export async function requireRole(roles: Role[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) {
    redirect('/unauthorized');
  }
  return session;
}

// Check if user has permission
export async function hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) return false;

  // Admin and Super Admin have all permissions
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    return true;
  }

  // Define role-based permissions
  const permissions: Record<Role, Record<string, string[]>> = {
    USER: {
      experiment: ['read:own', 'create', 'update:own', 'delete:own'],
      measurement: ['read:own', 'create:own', 'update:own', 'delete:own'],
      profile: ['read:own', 'update:own'],
    },
    RESEARCHER: {
      experiment: ['read:all', 'create', 'update:own', 'delete:own'],
      measurement: ['read:all', 'create:own', 'update:own', 'delete:own'],
      profile: ['read:own', 'update:own'],
      design: ['read:all', 'suggest'],
    },
    ADMIN: {
      // Admins have all permissions
    },
    SUPER_ADMIN: {
      // Super admins have all permissions
    },
  };

  const rolePermissions = permissions[user.role as Role];
  if (!rolePermissions) return false;
  
  const userPermissions = rolePermissions[resource] || [];
  return userPermissions.includes(action) || userPermissions.includes(`${action}:own`);
}

// Security headers middleware
export function securityHeaders() {
  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.messai.com",
  };
}