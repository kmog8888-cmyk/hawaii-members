import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const items = await prisma.menuItem.findMany({
    orderBy: [{ category: "asc" }, { position: "asc" }, { createdAt: "asc" }],
  });
  return Response.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { name, nameEn, price, description, imageUrl, category } = await req.json();
  if (!name || price === undefined) {
    return Response.json({ error: "名前と価格は必須です" }, { status: 400 });
  }

  const item = await prisma.menuItem.create({
    data: { name, nameEn: nameEn || null, price: Number(price), description: description || null, imageUrl: imageUrl || null, category: category || "food" },
  });
  return Response.json(item, { status: 201 });
}
