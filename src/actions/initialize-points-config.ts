'use server';

import { auth } from '@/lib/auth';
import { console } from '@/lib/logger';
import PointsService from '@/lib/points';
import { headers } from 'next/headers';

/**
 * Initialize default points system configuration
 * This action should be run by an admin to set up the points system
 */
export async function initializePointsConfig() {
  try {
    // Check if user is authenticated and is an admin
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== 'admin') {
      return {
        success: false,
        error: 'Unauthorized: Admin access required',
      };
    }

    // Initialize default configuration
    await PointsService.initializeDefaultConfig();

    return {
      success: true,
      message: 'Points system configuration initialized successfully',
    };
  } catch (error) {
    console.error('Error initializing points config:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to initialize points configuration',
    };
  }
}
