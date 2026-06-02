export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await req.json();
  const priceId =
    plan === "gold"
      ? process.env.STRIPE_GOLD_PRICE_ID!
      : process.env.STRIPE_SILVER_PRICE_ID!;

  const customer = await prisma.customer.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  });
  if (!customer) return Response.json({ error: "Customer not found" }, { status: 404 });

  // Stripeカスタマー取得 or 作成
  let stripeCustomerId = customer.stripeCustomerId;
  if (!stripeCustomerId) {
    const stripeCustomer = await stripe.customers.create({
      email: customer.user.email ?? undefined,
      name: customer.user.name ?? undefined,
      metadata: { customerId: customer.id },
    });
    stripeCustomerId = stripeCustomer.id;
    await prisma.customer.update({
      where: { id: customer.id },
      data: { stripeCustomerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/account?success=1`,
    cancel_url: `${process.env.NEXTAUTH_URL}/subscribe`,
    metadata: { customerId: customer.id, plan },
  });

  return Response.json({ url: checkoutSession.url });
}
