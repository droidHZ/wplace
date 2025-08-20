import { auth } from '@/lib/auth';
import { console } from '@/lib/logger';
import PointsService from '@/lib/points';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/points/summary
 * Get current user's points summary
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const summary = await PointsService.getUserPointsSummary(session.user.id);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error fetching points summary:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
