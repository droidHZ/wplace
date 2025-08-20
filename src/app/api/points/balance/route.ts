import { auth } from '@/lib/auth';
import { console } from '@/lib/logger';
import PointsService from '@/lib/points';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/points/balance
 * Get user's current points balance
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userSummary = await PointsService.getUserPointsSummary(session.user.id);

    return NextResponse.json({
      success: true,
      totalPoints: userSummary.totalPoints,
      totalEarned: userSummary.totalEarned,
      totalSpent: userSummary.totalSpent,
      pointsThisMonth: userSummary.pointsThisMonth,
      pointsThisYear: userSummary.pointsThisYear,
      lastTransaction: userSummary.lastTransaction,
    });
  } catch (error) {
    console.error('Error fetching points balance:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}