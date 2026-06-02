import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const campaign = await prisma.emailCampaign.findUnique({ where: { id } });
  if (!campaign) return Response.json({ error: "Not found" }, { status: 404 });
  if (campaign.status === "sent") return Response.json({ error: "既に送信済みです" }, { status: 409 });

  const where = campaign.targetTier === "all" ? {} : { tier: campaign.targetTier };
  const customers = await prisma.customer.findMany({ where });

  await prisma.$transaction([
    ...customers.map((c: { id: string }) =>
      prisma.emailLog.create({ data: { campaignId: id, customerId: c.id } })
    ),
    prisma.emailCampaign.update({
      where: { id },
      data: { status: "sent", sentAt: new Date() },
    }),
  ]);

  return Response.json({ sent: customers.length });
}
