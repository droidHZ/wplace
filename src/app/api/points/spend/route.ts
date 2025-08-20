import { auth } from '@/lib/auth';
import { console } from '@/lib/logger';
import PointsService from '@/lib/points';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/points/spend
 * Spend points (for testing purposes)
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
    const { amount, description } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Check if user has enough points
    const userSummary = await PointsService.getUserPointsSummary(
      session.user.id
    );
    if (userSummary.totalPoints < amount) {
      return NextResponse.json(
        { error: 'Insufficient points' },
        { status: 400 }
      );
    }

    // Spend points
    await PointsService.spendPoints({
      userId: session.user.id,
      amount,
      reason: 'manual_adjustment',
      description: description || 'Points test - spending',
      referenceType: 'manual',
    });

    // Get updated balance
    const updatedSummary = await PointsService.getUserPointsSummary(
      session.user.id
    );

    return NextResponse.json({
      success: true,
      message: 'Points spent successfully',
      newBalance: updatedSummary.totalPoints,
      amountSpent: amount,
    });
  } catch (error) {
    console.error('Error spending points:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
