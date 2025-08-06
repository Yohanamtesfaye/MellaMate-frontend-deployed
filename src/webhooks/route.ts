import { type NextRequest, NextResponse } from "next/server"

interface WebhookPayload {
  event: "payment.completed" | "payment.failed" | "payment.expired"
  payment_id: string
  amount: string
  currency: string
  stellar_transaction_id: string | null
  merchant_id: string
  metadata?: Record<string, any>
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const payload: WebhookPayload = await request.json()

    // Verify webhook signature (in real implementation)
    const signature = request.headers.get("x-xlmpay-signature")
    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 401 })
    }

    // Process webhook based on event type
    switch (payload.event) {
      case "payment.completed":
        console.log(`Payment ${payload.payment_id} completed for ${payload.amount} XLM`)
        // Update order status, send confirmation email, etc.
        break

      case "payment.failed":
        console.log(`Payment ${payload.payment_id} failed`)
        // Handle failed payment, notify customer, etc.
        break

      case "payment.expired":
        console.log(`Payment ${payload.payment_id} expired`)
        // Clean up expired payment, notify customer, etc.
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
