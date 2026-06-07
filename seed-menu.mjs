import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaLibSql({
  url: "libsql://hawaii-members-hawaii.aws-ap-northeast-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODAzNjYyODIsImlkIjoiMDE5ZTg2MTktMzgwMS03NmRlLTgyYzYtNWJmOGUyMjk5MTJhIiwicmlkIjoiNmEwYzI0ZWMtZDk0NS00MThjLTgzMTMtY2FlMTFhMDI2ODhhIn0.xvLuC3zFI3Fi-O-K_bgAPnw6iBgwMm_LVRiPL4unjGt06h_nVE3ILgBHfO1ZQurJWDMLudxe2dJ7I7kUNOjsAA",
});
const prisma = new PrismaClient({ adapter });

const items = [
  { name: "ラテ",             nameEn: "Latte",            price: 6.50,  category: "drinks",   description: "自家製エスプレッソと滑らかなスチームミルク",   position: 1 },
  { name: "マッチャラテ",      nameEn: "Matcha Latte",     price: 7.00,  category: "drinks",   description: "厳選された抹茶パウダーとオーツミルク",         position: 2 },
  { name: "アイスコーヒー",    nameEn: "Iced Coffee",      price: 5.50,  category: "drinks",   description: "コールドブリュー 24時間抽出",                  position: 3 },
  { name: "スムージー",        nameEn: "Smoothie",         price: 8.00,  category: "drinks",   description: "マンゴー・パイナップル・バナナのトロピカルブレンド", position: 4 },
  { name: "アサイーボウル",    nameEn: "Acai Bowl",        price: 14.00, category: "food",     description: "フレッシュフルーツ・グラノーラ・ハチミツ添え", position: 1 },
  { name: "アボカドトースト",  nameEn: "Avocado Toast",    price: 13.00, category: "food",     description: "自家製パン・アボカド・ポーチドエッグ",         position: 2 },
  { name: "エッグサンド",      nameEn: "Egg Sandwich",     price: 11.00, category: "food",     description: "ふわふわスクランブルエッグとベーコン",         position: 3 },
  { name: "スコーン",          nameEn: "Scone",            price: 5.00,  category: "sweets",   description: "バター香るサクサクの自家製スコーン",           position: 1 },
  { name: "バナナパンケーキ",  nameEn: "Banana Pancakes",  price: 12.00, category: "sweets",   description: "ハワイアンバナナとメープルシロップ",           position: 2 },
  { name: "クロワッサン",      nameEn: "Croissant",        price: 4.50,  category: "sweets",   description: "毎朝焼き立てのバタークロワッサン",             position: 3 },
  { name: "本日のスペシャル",  nameEn: "Daily Special",    price: 15.00, category: "specials", description: "シェフが毎朝厳選した旬の食材で作る一品",       position: 1 },
];

for (const item of items) {
  const created = await prisma.menuItem.create({ data: item });
  console.log(`✓ ${created.name} ($${created.price}) [${created.category}]`);
}

await prisma.$disconnect();
console.log(`\n${items.length}件追加完了！`);
