import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const settingsUpdateSchema = z.object({
  emailNotifications: z.boolean().optional(),
  experimentAlerts: z.boolean().optional(),
  collaborationRequests: z.boolean().optional(),
  newsletter: z.boolean().optional(),
  theme: z.enum(['dark', 'light']).optional(),
  units: z.enum(['metric', 'imperial']).optional(),
  language: z.string().optional(),
  dashboardLayout: z.any().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings) {
      // Create default settings if they don't exist
      const newSettings = await prisma.userSettings.create({
        data: {
          userId: session.user.id,
        },
      });
      
      return NextResponse.json(newSettings);
    }

    // Parse dashboard layout if it exists
    const settingsData = {
      ...settings,
      dashboardLayout: settings.dashboardLayout ? JSON.parse(settings.dashboardLayout) : null,
    };

    return NextResponse.json(settingsData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
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
    const validated = settingsUpdateSchema.parse(body);

    // Ensure settings exist
    const existingSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!existingSettings) {
      await prisma.userSettings.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    // Update settings
    const updatedSettings = await prisma.userSettings.update({
      where: { userId: session.user.id },
      data: {
        emailNotifications: validated.emailNotifications,
        experimentAlerts: validated.experimentAlerts,
        collaborationRequests: validated.collaborationRequests,
        newsletter: validated.newsletter,
        theme: validated.theme,
        units: validated.units,
        language: validated.language,
        dashboardLayout: validated.dashboardLayout ? JSON.stringify(validated.dashboardLayout) : undefined,
      },
    });

    // Parse dashboard layout back
    const responseData = {
      ...updatedSettings,
      dashboardLayout: updatedSettings.dashboardLayout ? JSON.parse(updatedSettings.dashboardLayout) : null,
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
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}