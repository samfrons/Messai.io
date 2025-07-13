import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const onboardingUpdateSchema = z.object({
  step: z.number().min(0).max(5),
  completed: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        onboardingStep: true,
        completedOnboarding: true,
      },
    });

    if (!profile) {
      // Create default profile if it doesn't exist
      const newProfile = await prisma.userProfile.create({
        data: {
          userId: session.user.id,
          interests: '[]',
        },
        select: {
          onboardingStep: true,
          completedOnboarding: true,
        },
      });
      
      return NextResponse.json(newProfile);
    }

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch onboarding status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = onboardingUpdateSchema.parse(body);

    // Ensure profile exists
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!existingProfile) {
      await prisma.userProfile.create({
        data: {
          userId: session.user.id,
          interests: '[]',
        },
      });
    }

    // Update onboarding status
    const updatedProfile = await prisma.userProfile.update({
      where: { userId: session.user.id },
      data: {
        onboardingStep: validated.step,
        completedOnboarding: validated.completed ?? (validated.step >= 5),
      },
      select: {
        onboardingStep: true,
        completedOnboarding: true,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update onboarding status' },
      { status: 500 }
    );
  }
}