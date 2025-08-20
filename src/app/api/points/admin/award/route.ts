import { auth } from '@/lib/auth';
import { console } from '@/lib/logger';
import PointsService from '@/lib/points';
import type {
  PointsReferenceType,
  PointsTransactionReason,
} from '@/types/points';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/points/admin/award
 * Award points to a user (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, amount, reason, description, referenceId, referenceType } =
      body;

    if (!userId || !amount || !reason) {
      return NextResponse.json(
        { success: false, error: 'userId, amount, and reason are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    const transaction = await PointsService.awardPoints({
      userId,
      amount: Number.parseInt(amount, 10),
      reason: reason as PointsTransactionReason,
      description: description || `Admin awarded ${amount} points`,
      referenceId,
      referenceType: referenceType as PointsReferenceType,
    });

    return NextResponse.json({
      success: true,
      data: transaction,
      message: `Successfully awarded ${amount} points to user ${userId}`,
    });
  } catch (error) {
    console.error('Error awarding points:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
