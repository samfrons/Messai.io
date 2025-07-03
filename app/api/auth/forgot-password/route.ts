import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { forgotPasswordSchema } from '@/lib/auth/validation';
import { generatePasswordResetToken } from '@/lib/auth/auth-utils';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validated = forgotPasswordSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email } = validated.data;

    // Rate limiting check - prevent spam
    const recentRequests = await prisma.passwordReset.count({
      where: {
        user: { email },
        createdAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
        },
      },
    });

    if (recentRequests >= 3) {
      return NextResponse.json(
        { error: 'Too many password reset requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return NextResponse.json({
        message: 'If an account exists with that email, we have sent password reset instructions.',
      });
    }

    // Mark any existing tokens as used
    await prisma.passwordReset.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Generate new reset token
    const resetToken = await generatePasswordResetToken(user.id);

    // Send reset email (if email service is configured)
    if (process.env.SMTP_HOST) {
      try {
        await sendPasswordResetEmail(user.email, resetToken, user.name);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Delete the token if email fails
        await prisma.passwordReset.delete({
          where: { token: resetToken },
        });
        return NextResponse.json(
          { error: 'Failed to send reset email. Please try again later.' },
          { status: 500 }
        );
      }
    } else {
      console.log(`Password reset token for ${user.email}: ${resetToken}`);
    }

    return NextResponse.json({
      message: 'If an account exists with that email, we have sent password reset instructions.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'An error occurred processing your request. Please try again.' },
      { status: 500 }
    );
  }
}