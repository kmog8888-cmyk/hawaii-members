export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  const { orderId } = await req.json();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });

  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: { name: item.name },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${process.env.NEXTAUTH_URL}/me/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/me/menu`,
    metadata: { orderId: order.id },
    customer_email: order.customerEmail || session?.user?.email || undefined,
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { stripeSessionId: checkoutSession.id },
  });

  return Response.json({ url: checkoutSession.url });
}
