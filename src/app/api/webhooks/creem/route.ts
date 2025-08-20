import { console } from '@/lib/logger';
import { handleWebhookEvent } from '@/payment';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Creem webhook handler
 * This endpoint receives webhook events from Creem and processes them
 *
 * @param req The incoming request
 * @returns NextResponse
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Get the request body as text
  const payload = await req.text();

  // Try different possible signature header names that Creem might use
  const signature =
    req.headers.get('x-creem-signature') ||
    req.headers.get('creem-signature') ||
    req.headers.get('signature') ||
    req.headers.get('x-signature') ||
    req.headers.get('webhook-signature') ||
    '';

  try {
    // Validate inputs
    if (!payload) {
      console.error('Creem webhook: Missing payload');
      return NextResponse.json(
        { error: 'Missing webhook payload' },
        { status: 400 }
      );
    }

    // Log all headers for debugging
    console.log(
      'Creem webhook headers:',
      Object.fromEntries(req.headers.entries())
    );
    console.log('Creem webhook payload preview:', payload.substring(0, 200));

    if (!signature) {
      console.error(
        'Creem webhook: No signature found in any expected headers'
      );
      return NextResponse.json(
        { error: 'Missing Creem signature' },
        { status: 400 }
      );
    }

    console.log(
      'Creem webhook: Processing with signature:',
      signature.substring(0, 20) + '...'
    );

    // Process the webhook event
    await handleWebhookEvent(payload, signature);

    // Return success
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error in Creem webhook route:', error);

    // Return error
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}
