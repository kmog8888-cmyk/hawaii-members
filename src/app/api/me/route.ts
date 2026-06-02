import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const customer = await prisma.customer.findUnique({
    where: { userId: session.user.id },
    include: {
      user: { select: { name: true, email: true, image: true } },
      pointsTransactions: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!customer) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(customer);
}
