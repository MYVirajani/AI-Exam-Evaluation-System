// /api/admin/pricing-plans/sync.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// helper function to extract description + features
function parseDescription(stripeDesc: string | null): {
  description: string;
  features: string[];
} {
  if (!stripeDesc) return { description: "", features: [] };

  // Split on ✔ or newlines
  const parts = stripeDesc
    .split("✔")
    .map((p) => p.trim())
    .filter(Boolean);

  const description = parts[0] ?? "";
  const features = parts.slice(1).map((f) => f.replace(/^[•-]\s*/, "").trim());

  return { description, features };
}

export async function POST() {
  try {
    // Fetch all active prices with expanded product
    const prices = await stripe.prices.list({
      active: true,
      expand: ["data.product"],
    });

    for (const price of prices.data) {
      const product = price.product as Stripe.Product;

      // ✅ Skip if product itself is not active
      if (!product.active) {
        console.log(`Skipping inactive product ${product.id} (${product.name})`);
        continue;
      }

      // parse description + features
      const { description, features } = parseDescription(
        product.description ?? ""
      );

      await prisma.pricing_Plan.upsert({
        where: { stripe_price_id: price.id },
        update: {
          name: product.name,
          description,
          price: price.unit_amount ? price.unit_amount / 100 : 0,
          stripe_product_id: product.id,
          billing_period: price.recurring?.interval ?? "custom",
          features,
        },
        create: {
          name: product.name,
          description,
          price: price.unit_amount ? price.unit_amount / 100 : 0,
          stripe_price_id: price.id,
          stripe_product_id: product.id,
          billing_period: price.recurring?.interval ?? "custom",
          features,
          evaluation_model: {
            connectOrCreate: {
              where: { model_name: "Default Model" },
              create: {
                model_name: "Default Model",
                description: "Auto-created for plan sync",
              },
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
