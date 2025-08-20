'use server';

import { console } from '@/lib/logger';
import { getSession } from '@/lib/server';
import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';

// Create a safe action client
const actionClient = createSafeActionClient();

// Input schema
const schema = z.object({
  userId: z.string().min(1, { message: 'User ID is required' }),
});

/**
 * Get user lifetime membership status directly from the database
 *
 * NOTE: Lifetime plans have been removed from this system.
 * This function now always returns false for lifetime membership status.
 * All memberships are now subscription-based (Plus, Pro, Ultra).
 */
export const getLifetimeStatusAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const { userId } = parsedInput;

    // Get the current user session for authorization
    const session = await getSession();
    if (!session) {
      console.warn(
        `unauthorized request to get lifetime status for user ${userId}`
      );
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Only allow users to check their own status unless they're admins
    if (session.user.id !== userId && session.user.role !== 'admin') {
      console.warn(
        `current user ${session.user.id} is not authorized to get lifetime status for user ${userId}`
      );
      return {
        success: false,
        error: 'Not authorized to do this action',
      };
    }

    // Since lifetime plans have been removed, always return false
    return {
      success: true,
      isLifetimeMember: false,
    };
  });
