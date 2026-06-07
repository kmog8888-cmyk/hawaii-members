import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaLibSql({
  url: "libsql://hawaii-members-hawaii.aws-ap-northeast-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODAzNjYyODIsImlkIjoiMDE5ZTg2MTktMzgwMS03NmRlLTgyYzYtNWJmOGUyMjk5MTJhIiwicmlkIjoiNmEwYzI0ZWMtZDk0NS00MThjLTgzMTMtY2FlMTFhMDI2ODhhIn0.xvLuC3zFI3Fi-O-K_bgAPnw6iBgwMm_LVRiPL4unjGt06h_nVE3ILgBHfO1ZQurJWDMLudxe2dJ7I7kUNOjsAA",
});
const prisma = new PrismaClient({ adapter });

const photos = {
  "ラテ":            "https://images.unsplash.com/photo-1561047029-3000c68339ca?w=600&q=80",
  "マッチャラテ":    "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&q=80",
  "アイスコーヒー":  "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80",
  "スムージー":      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600&q=80",
  "アサイーボウル":  "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80",
  "アボカドトースト":"https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=600&q=80",
  "エッグサンド":    "https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=600&q=80",
  "スコーン":        "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80",
  "バナナパンケーキ":"https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80",
  "クロワッサン":    "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80",
  "本日のスペシャル":"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
};

const items = await prisma.menuItem.findMany();

for (const item of items) {
  const imageUrl = photos[item.name];
  if (imageUrl) {
    await prisma.menuItem.update({ where: { id: item.id }, data: { imageUrl } });
    console.log(`✓ ${item.name}`);
  }
}

await prisma.$disconnect();
console.log("\n写真追加完了！");
