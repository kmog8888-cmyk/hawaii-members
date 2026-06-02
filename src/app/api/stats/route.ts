import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [totalCustomers, tierCounts, totalPoints, activeSubs] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.groupBy({ by: ["tier"], _count: { id: true } }),
    prisma.customer.aggregate({ _sum: { totalPoints: true } }),
    prisma.customer.count({ where: { subscriptionStatus: "active" } }),
  ]);

  const tiers = { bronze: 0, silver: 0, gold: 0 } as Record<string, number>;
  for (const t of tierCounts) tiers[t.tier] = t._count.id;

  return Response.json({
    totalCustomers,
    totalPoints: totalPoints._sum.totalPoints ?? 0,
    activeSubs,
    tiers,
  });
}
