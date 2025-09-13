import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// POST /api/admin/pricing-plans/sync → Sync products and prices from Stripe
export async function POST() {
  try {
    // Fetch products and prices from Stripe
    const products = await stripe.products.list({ expand: ["data.default_price"] });
    console.log('products: ',products);

    for (const product of products.data) {
      const price = product.default_price as Stripe.Price;
      if (!price || !price.unit_amount) continue;

      // Upsert into DB
      await prisma.pricing_Plan.upsert({
        where: { stripe_price_id: price.id },
        update: {
          name: product.name,
          description: product.description ?? "",
          price: price.unit_amount / 100,
          billing_period: price.recurring?.interval ?? "Yonth",
          stripe_product_id: product.id,
        },
        create: {
          name: product.name,
          description: product.description ?? "",
          price: price.unit_amount / 100,
          billing_period: price.recurring?.interval ?? "Yonth",
          stripe_price_id: price.id,
          stripe_product_id: product.id,
          features: [], // add if you parse metadata/features
          model_id: "c0300163-2ac8-4050-93c2-1e5f77ecc053", // set appropriate Evaluation_Model ID
        },
      });
    }

    return NextResponse.json({ success: true, message: "Pricing plans synced successfully" });
  } catch (error: any) {
    console.error("Stripe sync failed:", error);
    return NextResponse.json(
      { error: "Failed to sync pricing plans" },
      { status: 500 }
    );
  }
}
