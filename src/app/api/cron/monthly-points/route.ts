import { NextRequest, NextResponse } from 'next/server';
import { console } from '@/lib/logger';
import PointsService from '@/lib/points';

/**
 * Daily cron job to process monthly points for annual subscriptions
 * This runs daily but only awards points once per month for each user
 * 
 * Usage:
 * - Set up a daily cron job to call GET /api/cron/monthly-points
 * - Or use Vercel Cron Jobs: https://vercel.com/docs/cron-jobs
 * - Or use GitHub Actions scheduled workflow
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('❌ [CRON] Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 [CRON] Starting monthly points processing...');
    
    await PointsService.processMonthlyAnnualSubscriptionPoints();
    
    console.log('✅ [CRON] Monthly points processing completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Monthly points processing completed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ [CRON] Error in monthly points processing:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST method for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}