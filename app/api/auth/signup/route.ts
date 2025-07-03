import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signupSchema } from '@/lib/auth/validation';
import { hashPassword, generateVerificationToken } from '@/lib/auth/auth-utils';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validated = signupSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, name, institution, researchArea } = validated.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        institution,
        researchArea,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Generate verification token
    const verificationToken = await generateVerificationToken(email, user.id);

    // Send verification email (if email service is configured)
    if (process.env.SMTP_HOST) {
      await sendVerificationEmail(email, verificationToken);
    }

    return NextResponse.json(
      {
        message: 'Account created successfully. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup. Please try again.' },
      { status: 500 }
    );
  }
}