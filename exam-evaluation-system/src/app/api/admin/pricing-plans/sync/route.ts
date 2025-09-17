// /api/admin/pricing-plans/sync.ts (Next.js route example)
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  try {
    // Fetch all active prices + products from Stripe
    const prices = await stripe.prices.list({
      active: true,
      expand: ["data.product"],
    });

    for (const price of prices.data) {
      const product = price.product as Stripe.Product;

      // Update or insert into DB
      await prisma.pricing_Plan.upsert({
        where: { stripe_price_id: price.id },
        update: {
          name: product.name,
          description: product.description ?? "",
          price: price.unit_amount ? price.unit_amount / 100 : 0,
          stripe_product_id: product.id,
          billing_period: price.recurring?.interval ?? "custom",
        },
        create: {
          name: product.name,
          description: product.description ?? "",
          price: price.unit_amount ? price.unit_amount / 100 : 0,
          stripe_price_id: price.id,
          stripe_product_id: product.id,
          billing_period: price.recurring?.interval ?? "custom",
          features: [],
          evaluation_model: {
            create: {
              model_name: "Default Model",
              description: "Auto-created for plan sync",
            },
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to sync from Stripe" },
      { status: 500 }
    );
  }
}
