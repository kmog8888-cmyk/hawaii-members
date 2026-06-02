import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return Response.json({ error: "名前・メール・パスワードは必須です" }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "パスワードは8文字以上にしてください" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "このメールは既に登録されています" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: "customer" },
  });

  // Customer レコードも同時作成
  await prisma.customer.create({
    data: { userId: user.id, tier: "bronze", totalPoints: 0 },
  });

  return Response.json({ success: true }, { status: 201 });
}
