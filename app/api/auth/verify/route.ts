import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      );
    }

    // Update user's email verification status
    await prisma.user.update({
      where: { id: verificationToken.userId! },
      data: { 
        emailVerified: new Date(),
      },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    // Email verification successful
    return NextResponse.json({
      message: 'Email verified successfully',
      email: verificationToken.user?.email,
    });
  } catch (error) {
    // Handle unexpected errors
    return NextResponse.json(
      { error: 'An error occurred during email verification' },
      { status: 500 }
    );
  }
}