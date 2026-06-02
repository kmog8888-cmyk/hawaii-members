import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, image: true } },
      pointsTransactions: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
  if (!customer) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(customer);
}
