export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { calcTier, SUBSCRIPTION_PLANS } from "@/lib/tier";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const getCustomer = async (stripeCustomerId: string) =>
    prisma.customer.findUnique({ where: { stripeCustomerId } });

  // 注文の支払い完了
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata?.orderId) {
      await prisma.order.update({
        where: { id: session.metadata.orderId },
        data: { status: "paid" },
      });
      return Response.json({ received: true });
    }
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customer = await getCustomer(sub.customer as string);
      if (!customer) break;

      const plan = sub.metadata.plan as "silver" | "gold" | undefined;
      const isActive = sub.status === "active";

      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          subscriptionId: sub.id,
          subscriptionStatus: sub.status,
          subscriptionPlan: isActive ? plan : null,
          tier: calcTier(customer.totalPoints, isActive ? plan : null),
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customer = await getCustomer(sub.customer as string);
      if (!customer) break;

      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          subscriptionStatus: "canceled",
          subscriptionPlan: null,
          tier: calcTier(customer.totalPoints, null),
        },
      });
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.billing_reason !== "subscription_cycle") break;

      const customer = await getCustomer(invoice.customer as string);
      if (!customer?.subscriptionPlan) break;

      const plan = SUBSCRIPTION_PLANS[customer.subscriptionPlan as "silver" | "gold"];
      const newTotal = customer.totalPoints + plan.points;

      await prisma.$transaction([
        prisma.pointsTransaction.create({
          data: {
            customerId: customer.id,
            points: plan.points,
            type: "subscription",
            description: `${plan.name} 月次ポイント`,
          },
        }),
        prisma.customer.update({
          where: { id: customer.id },
          data: { totalPoints: newTotal },
        }),
      ]);
      break;
    }
  }

  return Response.json({ received: true });
}
