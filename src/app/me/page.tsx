"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Star, QrCode, CreditCard, LogOut, Gamepad2 } from "lucide-react";
import Link from "next/link";
import TierBadge from "@/components/TierBadge";
import { TIER_DISCOUNT, SUBSCRIPTION_PLANS } from "@/lib/tier";

type Me = {
  id: string; tier: string; totalPoints: number;
  subscriptionPlan: string | null; subscriptionStatus: string | null;
  user: { name: string | null; email: string | null; image: string | null };
  pointsTransactions: { id: string; points: number; type: string; description: string | null; createdAt: string }[];
};

const tierEmoji: Record<string, string> = { bronze: "🥉", silver: "🥈", gold: "🥇" };
const nextTier: Record<string, { name: string; pts: number }> = {
  bronze: { name: "Silver", pts: 500 },
  silver: { name: "Gold", pts: 2000 },
  gold: { name: "Gold", pts: 2000 },
};

export default function MePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => {
        if (r.status === 401) { router.push("/"); return null; }
        return r.json();
      })
      .then((d) => { if (d) setMe(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
      <div className="text-4xl animate-bounce">🌺</div>
    </div>
  );
  if (!me) return null;

  const isActive = me.subscriptionStatus === "active";
  const discount = TIER_DISCOUNT[me.tier as keyof typeof TIER_DISCOUNT] ?? 0;
  const next = nextTier[me.tier];
  const ptsToNext = next ? Math.max(0, next.pts - me.totalPoints) : 0;
  const pct = me.tier === "gold" ? 100
    : me.tier === "silver" ? Math.min(100, Math.round(((me.totalPoints - 500) / 1500) * 100))
    : Math.min(100, Math.round((me.totalPoints / 500) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white max-w-sm mx-auto">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-6 pt-14 pb-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium tracking-widest opacity-80 uppercase">Hawaii Restaurant</p>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="opacity-70 hover:opacity-100">
            <LogOut size={18} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          {me.user.image
            ? <img src={me.user.image} alt="" className="w-12 h-12 rounded-full border-2 border-white/50" />
            : <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl">🌺</div>
          }
          <div>
            <h1 className="font-bold text-lg">{me.user.name ?? "ゲスト"}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <TierBadge tier={me.tier} />
              {isActive && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">サブスク有効</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-8">
        {/* ポイントカード */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500 flex items-center gap-1"><Star size={14} className="text-yellow-500" /> 保有ポイント</span>
            {discount > 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{discount}% OFF 適用中</span>}
          </div>
          <p className="text-4xl font-bold text-slate-800 mb-3">
            {me.totalPoints.toLocaleString()}<span className="text-lg font-normal text-slate-400 ml-1">pt</span>
          </p>

          {me.tier !== "gold" && (
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{tierEmoji[me.tier]} {me.tier}</span>
                <span>あと{ptsToNext.toLocaleString()}ptで {next.name} {tierEmoji[me.tier === "bronze" ? "silver" : "gold"]}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
          {me.tier === "gold" && (
            <p className="text-xs text-yellow-600 font-medium">🥇 最高ランク達成！</p>
          )}
        </div>

        {/* アクションボタン */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/me/checkin" className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
            <div className="bg-orange-50 rounded-xl p-3"><QrCode size={22} className="text-orange-500" /></div>
            <span className="text-xs font-medium text-slate-700">チェックイン</span>
          </Link>
          <Link href="/me/game" className="bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl shadow-sm p-4 flex flex-col items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="bg-white/20 rounded-xl p-3"><Gamepad2 size={22} className="text-white" /></div>
            <span className="text-xs font-medium text-white">ゲーム</span>
          </Link>
          <Link href="/subscribe" className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-sm p-4 flex flex-col items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="bg-white/20 rounded-xl p-3"><CreditCard size={22} className="text-white" /></div>
            <span className="text-xs font-medium text-white">サブスク</span>
          </Link>
        </div>

        {/* 特典 */}
        {discount > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100 rounded-2xl p-4">
            <p className="text-sm font-semibold text-orange-700 mb-1">🎉 あなたの特典</p>
            <p className="text-sm text-orange-600">全メニュー <strong>{discount}% OFF</strong></p>
            {isActive && <p className="text-xs text-orange-500 mt-1">毎月 {SUBSCRIPTION_PLANS[me.subscriptionPlan as "silver" | "gold"]?.points}pt プレゼント</p>}
          </div>
        )}

        {/* ポイント履歴 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-700 text-sm">ポイント履歴</h3>
          </div>
          {me.pointsTransactions.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">まだ履歴がありません</p>
          ) : (
            <ul className="divide-y divide-slate-50">
              {me.pointsTransactions.slice(0, 8).map((t) => (
                <li key={t.id} className="flex justify-between px-4 py-3">
                  <div>
                    <p className="text-sm text-slate-700">{t.description ?? t.type}</p>
                    <p className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleDateString("ja-JP")}</p>
                  </div>
                  <span className={`text-sm font-semibold self-center ${t.points > 0 ? "text-green-500" : "text-red-400"}`}>
                    {t.points > 0 ? "+" : ""}{t.points}pt
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
