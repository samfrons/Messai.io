import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  avatar: z.string().url().optional().nullable(),
  expertise: z.string().max(500).optional().nullable(),
  interests: z.array(z.string()).optional(),
  publicProfile: z.boolean().optional(),
  linkedIn: z.string().url().optional().nullable(),
  orcid: z.string().optional().nullable(),
  googleScholar: z.string().url().optional().nullable(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            institution: true,
            researchArea: true,
            bio: true,
          },
        },
      },
    });

    if (!profile) {
      // Create default profile if it doesn't exist
      const newProfile = await prisma.userProfile.create({
        data: {
          userId: session.user.id,
          interests: '[]',
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              institution: true,
              researchArea: true,
              bio: true,
            },
          },
        },
      });
      
      return NextResponse.json(newProfile);
    }

    // Parse interests from JSON string
    const profileData = {
      ...profile,
      interests: JSON.parse(profile.interests),
    };

    return NextResponse.json(profileData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = profileUpdateSchema.parse(body);

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

    // Update profile
    const updatedProfile = await prisma.userProfile.update({
      where: { userId: session.user.id },
      data: {
        avatar: validated.avatar,
        expertise: validated.expertise,
        interests: validated.interests ? JSON.stringify(validated.interests) : undefined,
        publicProfile: validated.publicProfile,
        linkedIn: validated.linkedIn,
        orcid: validated.orcid,
        googleScholar: validated.googleScholar,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            institution: true,
            researchArea: true,
            bio: true,
          },
        },
      },
    });

    // Parse interests back to array
    const responseData = {
      ...updatedProfile,
      interests: JSON.parse(updatedProfile.interests),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}