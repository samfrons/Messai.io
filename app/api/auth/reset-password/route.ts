import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { resetPasswordSchema } from '@/lib/auth/validation';
import { hashPassword } from '@/lib/auth/auth-utils';
import { sendPasswordChangeNotificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validated = resetPasswordSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { token, password } = validated.data;

    // Find the reset token
    const passwordReset = await prisma.passwordReset.findUnique({
      where: { token },
      include: { 
        user: {
          select: { id: true, email: true, name: true }
        } 
      },
    });

    if (!passwordReset) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token has been used
    if (passwordReset.used) {
      return NextResponse.json(
        { error: 'This reset link has already been used' },
        { status: 400 }
      );
    }

    // Check if token has expired (24 hours)
    if (passwordReset.expires < new Date()) {
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user password and mark token as used in a transaction
    await prisma.$transaction(async (tx) => {
      // Update user password
      await tx.user.update({
        where: { id: passwordReset.userId },
        data: { 
          password: hashedPassword,
          // Optionally invalidate all sessions for security
          // This would require the user to log in again
        },
      });

      // Mark token as used
      await tx.passwordReset.update({
        where: { id: passwordReset.id },
        data: { used: true },
      });

      // Invalidate all other unused reset tokens for this user
      await tx.passwordReset.updateMany({
        where: {
          userId: passwordReset.userId,
          used: false,
          id: { not: passwordReset.id },
        },
        data: { used: true },
      });
    });

    // Send notification email about password change
    if (process.env.SMTP_HOST && passwordReset.user) {
      try {
        await sendPasswordChangeNotificationEmail(
          passwordReset.user.email,
          passwordReset.user.name
        );
      } catch (emailError) {
        // Log error but don't fail the request
        console.error('Failed to send password change notification:', emailError);
      }
    }

    // Log successful password reset
    console.log(`Password reset successful for user: ${passwordReset.user?.email}`);

    return NextResponse.json({
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'An error occurred resetting your password. Please try again.' },
      { status: 500 }
    );
  }
}