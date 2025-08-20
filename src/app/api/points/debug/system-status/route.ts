import { auth } from '@/lib/auth';
import { console } from '@/lib/logger';
import PointsService from '@/lib/points';
import { PointsConfigKeys } from '@/types/points';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/points/debug/system-status
 * Check points system status and configuration (for debugging)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(
      `🔍 [DEBUG] Checking points system status for debug request from user ${session.user.id}`
    );

    // Check all key configuration values
    const configChecks = await Promise.all([
      PointsService.getConfigValue(
        PointsConfigKeys.POINTS_SYSTEM_ENABLED,
        true
      ),
      PointsService.getConfigValue(PointsConfigKeys.SIGNUP_BONUS, 0),
      PointsService.getConfigValue(
        PointsConfigKeys.SUBSCRIPTION_SIGNUP_BONUS,
        0
      ),
      PointsService.getConfigValue(
        PointsConfigKeys.SUBSCRIPTION_REWARD_RATE,
        0
      ),
      PointsService.getConfigValue(PointsConfigKeys.PLAN_BONUSES, {}),
    ]);

    const [
      systemEnabled,
      signupBonus,
      subscriptionBonus,
      rewardRate,
      planBonuses,
    ] = configChecks;

    // Get user's current points summary
    let userSummary = null;
    try {
      userSummary = await PointsService.getUserPointsSummary(session.user.id);
    } catch (error) {
      console.error('Error getting user points summary:', error);
    }

    const status = {
      systemEnabled,
      signupBonus,
      subscriptionBonus,
      rewardRate,
      planBonuses,
      userSummary,
      timestamp: new Date().toISOString(),
      userId: session.user.id,
    };

    console.log(
      `📊 [DEBUG] Points system status:`,
      JSON.stringify(status, null, 2)
    );

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('❌ [DEBUG] Error checking points system status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
