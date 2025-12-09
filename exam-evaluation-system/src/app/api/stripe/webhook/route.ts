import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// ✅ IMPORTANT: Disable Next.js body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("❌ Missing Stripe signature");
    return new NextResponse("No signature", { status: 400 });
  }

  // ✅ Read RAW body
  const body = await req.arrayBuffer();
  const payload = Buffer.from(body);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
  } catch (err: any) {
    console.error("❌ Webhook verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // ✅ Payment success
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const educator_id = session.metadata?.educator_id;
    const pricing_plan_id = session.metadata?.pricing_plan_id;

    if (!educator_id || !pricing_plan_id) {
      console.error("❌ Missing metadata");
      return new NextResponse("Missing metadata", { status: 400 });
    }

    // ✅ Prevent duplicates
    const existing = await prisma.subscription.findFirst({
      where: {
        stripe_subscription_id: session.subscription as string,
      },
    });

    if (!existing) {
      await prisma.subscription.create({
        data: {
          educator_id,
          pricing_plan_id,
          status: "ACTIVE",
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          start_date: new Date(),
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
