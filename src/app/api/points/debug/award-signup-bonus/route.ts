import { auth } from '@/lib/auth';
import { console } from '@/lib/logger';
import PointsService from '@/lib/points';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/points/debug/award-signup-bonus
 * Manually award signup bonus points (for debugging)
 * This should only be used for debugging Creem integration issues
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json(
        { error: 'planId is required' },
        { status: 400 }
      );
    }

    console.log(
      `Manual debug: Awarding signup bonus for user ${session.user.id}, plan ${planId}`
    );

    // Award subscription signup bonus
    await PointsService.handleSubscriptionSignup(session.user.id, planId);

    // Get updated balance
    const updatedSummary = await PointsService.getUserPointsSummary(
      session.user.id
    );

    return NextResponse.json({
      success: true,
      message: `Subscription signup bonus awarded for plan: ${planId}`,
      newBalance: updatedSummary.totalPoints,
      userId: session.user.id,
      planId,
    });
  } catch (error) {
    console.error('Error in debug award signup bonus:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
