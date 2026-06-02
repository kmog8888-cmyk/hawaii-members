import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const TURSO_DATABASE_URL = "libsql://hawaii-members-hawaii.aws-ap-northeast-1.turso.io";
const TURSO_AUTH_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODAzNjYyODIsImlkIjoiMDE5ZTg2MTktMzgwMS03NmRlLTgyYzYtNWJmOGUyMjk5MTJhIiwicmlkIjoiNmEwYzI0ZWMtZDk0NS00MThjLTgzMTMtY2FlMTFhMDI2ODhhIn0.xvLuC3zFI3Fi-O-K_bgAPnw6iBgwMm_LVRiPL4unjGt06h_nVE3ILgBHfO1ZQurJWDMLudxe2dJ7I7kUNOjsAA";

const adapter = new PrismaLibSql({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN });
const prisma = new PrismaClient({ adapter });

const members = [
  { name: "Hikaru Tomura",  email: "tomura@hackjpn.com", password: "hikarutomura", points: 0,    tier: "bronze", txs: [] },
  { name: "Aloha Yamada",   email: "yamada@example.com", password: "pass1234",     points: 2400, tier: "gold",   txs: [{ p: 1200, t: "earn", d: "ディナー来店" }, { p: 1300, t: "earn", d: "パーティー利用" }, { p: -100, t: "redeem", d: "割引利用" }] },
  { name: "Kai Nakamura",   email: "kai@example.com",    password: "pass1234",     points: 850,  tier: "silver", txs: [{ p: 500, t: "earn", d: "ランチ来店" }, { p: 400, t: "earn", d: "ディナー来店" }, { p: -50, t: "redeem", d: "ドリンク割引" }] },
  { name: "Lani Suzuki",    email: "lani@example.com",   password: "pass1234",     points: 620,  tier: "silver", txs: [{ p: 700, t: "earn", d: "ディナー来店" }, { p: -80, t: "redeem", d: "クーポン利用" }] },
  { name: "Hana Watanabe",  email: "hana@example.com",   password: "pass1234",     points: 310,  tier: "bronze", txs: [{ p: 310, t: "earn", d: "初回来店" }] },
  { name: "Koa Tanaka",     email: "koa@example.com",    password: "pass1234",     points: 180,  tier: "bronze", txs: [{ p: 120, t: "earn", d: "ランチ来店" }, { p: 60, t: "earn", d: "テイクアウト" }] },
  { name: "Mele Sato",      email: "mele@example.com",   password: "pass1234",     points: 1500, tier: "silver", txs: [{ p: 800, t: "earn", d: "ディナー来店" }, { p: 750, t: "earn", d: "誕生日ディナー" }, { p: -50, t: "redeem", d: "割引利用" }] },
  { name: "Nalu Ito",       email: "nalu@example.com",   password: "pass1234",     points: 3100, tier: "gold",   txs: [{ p: 1500, t: "earn", d: "パーティー幹事" }, { p: 1800, t: "earn", d: "ディナー来店" }, { p: -200, t: "redeem", d: "コース割引" }] },
  { name: "Pua Kobayashi",  email: "pua@example.com",    password: "pass1234",     points: 75,   tier: "bronze", txs: [{ p: 75, t: "earn", d: "初回来店" }] },
];

for (const m of members) {
  const existing = await prisma.user.findUnique({ where: { email: m.email } });
  if (existing) { console.log(`skip: ${m.email}`); continue; }

  const hashed = await bcrypt.hash(m.password, 10);
  const user = await prisma.user.create({
    data: { name: m.name, email: m.email, password: hashed, role: "customer" },
  });
  const customer = await prisma.customer.create({
    data: { userId: user.id, tier: m.tier, totalPoints: m.points },
  });
  for (const tx of m.txs) {
    await prisma.pointsTransaction.create({
      data: { customerId: customer.id, points: tx.p, type: tx.t, description: tx.d },
    });
  }
  console.log(`✓ ${m.name} (${m.tier}, ${m.points}pt)`);
}

const camps = [
  { subject: "🌺 Gold会員限定プレゼント企画", body: "Gold会員の皆様、今月のご来店で200ptプレゼント！", targetTier: "gold", status: "sent", sentAt: new Date("2026-05-15") },
  { subject: "Silver会員感謝セール開催中", body: "Silver会員の皆様へ、今週末全メニュー5%OFF！", targetTier: "silver", status: "sent", sentAt: new Date("2026-05-22") },
  { subject: "🎉 6月ハワイアンナイトご招待", body: "全会員の皆様へ、6月のスペシャルイベントにご招待します！", targetTier: "all", status: "draft" },
];

for (const c of camps) {
  await prisma.emailCampaign.create({ data: c });
  console.log(`✓ campaign: ${c.subject}`);
}

await prisma.$disconnect();
console.log("\ndone!");
