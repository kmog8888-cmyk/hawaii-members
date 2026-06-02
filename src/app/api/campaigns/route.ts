import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const campaigns = await prisma.emailCampaign.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { emailLogs: true } } },
  });
  return Response.json(campaigns);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, body, targetTier } = await req.json();
  if (!subject || !body) {
    return Response.json({ error: "件名と本文は必須です" }, { status: 400 });
  }

  const campaign = await prisma.emailCampaign.create({
    data: { subject, body, targetTier: targetTier || "all", status: "draft" },
  });
  return Response.json(campaign, { status: 201 });
}
