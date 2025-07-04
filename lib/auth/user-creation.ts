import { prisma } from '@/lib/db';

/**
 * Creates UserProfile and UserSettings for a new user
 * This ensures all necessary records exist for proper app functionality
 */
export async function createUserProfileAndSettings(userId: string) {
  try {
    // Create UserProfile if it doesn't exist
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      await prisma.userProfile.create({
        data: {
          userId,
          interests: '[]',
          completedOnboarding: false,
          onboardingStep: 0,
        },
      });
    }

    // Create UserSettings if it doesn't exist
    const existingSettings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!existingSettings) {
      await prisma.userSettings.create({
        data: {
          userId,
          theme: 'dark',
          units: 'metric',
          language: 'en',
          emailNotifications: true,
          experimentAlerts: true,
          collaborationRequests: true,
          newsletter: false,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating user profile/settings:', error);
    return { success: false, error };
  }
}

/**
 * Ensures user has all required records after OAuth sign-in
 */
export async function ensureUserRecords(userId: string) {
  try {
    // Check and create UserProfile
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        interests: '[]',
        completedOnboarding: false,
        onboardingStep: 0,
      },
    });

    // Check and create UserSettings
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        theme: 'dark',
        units: 'metric',
        language: 'en',
        emailNotifications: true,
        experimentAlerts: true,
        collaborationRequests: true,
        newsletter: false,
      },
    });

    return { success: true, profile, settings };
  } catch (error) {
    console.error('Error ensuring user records:', error);
    return { success: false, error };
  }
}