import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { metadata } from "@/app/layout";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('metadata:',metadata);

      // Get metadata from session
      // const educator_id = session.metadata?.educator_id!;
      // const pricing_plan_id = session.metadata?.pricing_plan_id!;
      const educator_id = '4f5b82b8-6a4f-46ce-ac3a-01edc6472091'; 
      const pricing_plan_id = '00a522a4-9258-4e56-a8d8-6828b39c5cc3';
      const stripe_subscription_id = session.subscription as string;
      const stripe_customer_id = session.customer as string;

      // Update subscription in DB
      await prisma.subscription.updateMany({
        where: {
          educator_id,
          pricing_plan_id,
          status: "INCOMPLETE",
        },
        data: {
          status: "ACTIVE",
          stripe_subscription_id,
          stripe_customer_id,
          start_date: new Date(),
          end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)), // example for 1-month plan
        },
      });

      break;

    // case "invoice.payment_failed":
    //   const failedInvoice = event.data.object as Stripe.Invoice;
    //   // Handle failed payment: update subscription status to FAILED or PAST_DUE
    //   await prisma.subscription.updateMany({
    //     where: { stripe_subscription_id: failedInvoice.subscription as string },
    //     data: { status: "FAILED" },
    //   });
    //   break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
