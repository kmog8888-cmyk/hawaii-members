import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const tier = searchParams.get("tier") ?? "";

  const customers = await prisma.customer.findMany({
    where: {
      AND: [
        q ? { user: { OR: [{ name: { contains: q } }, { email: { contains: q } }] } } : {},
        tier ? { tier } : {},
      ],
    },
    include: { user: { select: { name: true, email: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(customers);
}
