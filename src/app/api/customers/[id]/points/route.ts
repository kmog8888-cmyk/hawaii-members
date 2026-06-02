import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcTier } from "@/lib/tier";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { points, type, description } = await req.json();

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) return Response.json({ error: "Not found" }, { status: 404 });

  const delta = type === "redeem" ? -Math.abs(points) : Math.abs(points);
  const newTotal = Math.max(0, customer.totalPoints + delta);
  const newTier = calcTier(newTotal, customer.subscriptionPlan);

  const [transaction, updated] = await prisma.$transaction([
    prisma.pointsTransaction.create({
      data: { customerId: id, points: delta, type, description: description || null },
    }),
    prisma.customer.update({
      where: { id },
      data: { totalPoints: newTotal, tier: newTier },
    }),
  ]);

  return Response.json({ transaction, customer: updated });
}
