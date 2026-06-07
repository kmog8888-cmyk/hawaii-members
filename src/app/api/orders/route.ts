import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, customer: { include: { user: { select: { name: true } } } } },
    take: 100,
  });
  return Response.json(orders);
}

export async function POST(req: NextRequest) {
  const { items, note, customerId, customerName, customerEmail } = await req.json();
  if (!items?.length) return Response.json({ error: "カートが空です" }, { status: 400 });

  const count = await prisma.order.count();
  const order = await prisma.order.create({
    data: {
      customerId: customerId || null,
      customerName: customerName || null,
      customerEmail: customerEmail || null,
      status: "pending",
      total: items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0),
      note: note || null,
      orderNumber: count + 1,
      items: {
        create: items.map((i: { menuItemId: string; name: string; price: number; quantity: number }) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      },
    },
  });
  return Response.json(order, { status: 201 });
}
