import { auth } from '@/lib/auth';
import { console } from '@/lib/logger';
import PointsService from '@/lib/points';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/points/transactions
 * Get current user's points transaction history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = Number.parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = Number.parseInt(url.searchParams.get('offset') || '0', 10);

    const transactions = await PointsService.getUserTransactions(
      session.user.id,
      Math.min(limit, 100), // Cap at 100
      Math.max(offset, 0) // Ensure non-negative
    );

    return NextResponse.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error('Error fetching points transactions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
