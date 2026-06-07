import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name, nameEn, price, description, imageUrl, category, available } = await req.json();

  const item = await prisma.menuItem.update({
    where: { id },
    data: { name, nameEn: nameEn || null, price: Number(price), description: description || null, imageUrl: imageUrl || null, category, available: available ?? true },
  });
  return Response.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.menuItem.delete({ where: { id } });
  return Response.json({ success: true });
}
