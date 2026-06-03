"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { QrCode, CreditCard, Gamepad2, LogOut } from "lucide-react";
import Link from "next/link";
import { TIER_DISCOUNT, SUBSCRIPTION_PLANS } from "@/lib/tier";

type Me = {
  id: string; tier: string; totalPoints: number;
  subscriptionPlan: string | null; subscriptionStatus: string | null;
  user: { name: string | null; email: string | null; image: string | null };
  pointsTransactions: { id: string; points: number; type: string; description: string | null; createdAt: string }[];
};

const tierConfig = {
  bronze: { label: "Bronze", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  silver: { label: "Silver", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
  gold:   { label: "Gold",   color: "text-[#C4962A]", bg: "bg-yellow-50", border: "border-yellow-200" },
};

const nextTier = {
  bronze: { name: "Silver", pts: 500 },
  silver: { name: "Gold",   pts: 2000 },
  gold:   { name: "Gold",   pts: 2000 },
};

export default function MePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => { if (r.status === 401) { router.push("/"); return null; } return r.json(); })
      .then((d) => { if (d) setMe(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#C4962A] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
  if (!me) return null;

  const tier = tierConfig[me.tier as keyof typeof tierConfig] ?? tierConfig.bronze;
  const isActive = me.subscriptionStatus === "active";
  const discount = TIER_DISCOUNT[me.tier as keyof typeof TIER_DISCOUNT] ?? 0;
  const next = nextTier[me.tier as keyof typeof nextTier];
  const ptsToNext = Math.max(0, next.pts - me.totalPoints);
  const pct = me.tier === "gold" ? 100
    : me.tier === "silver" ? Math.min(100, Math.round(((me.totalPoints - 500) / 1500) * 100))
    : Math.min(100, Math.round((me.totalPoints / 500) * 100));

  return (
    <div className="min-h-screen bg-[#FAFAFA] max-w-sm mx-auto">
      {/* ヘッダー */}
      <div className="bg-[#1C1C1E] px-6 pt-14 pb-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] tracking-[0.3em] text-[#C4962A] uppercase">Alohabake & cafe</p>
            <p className="text-[10px] tracking-[0.2em] text-white/40 uppercase">Kaka'ako</p>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-white/40 hover:text-white/80 transition-colors">
            <LogOut size={16} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          {me.user.image
            ? <img src={me.user.image} alt="" className="w-12 h-12 rounded-full border border-white/20" />
            : <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lg">✦</div>
          }
          <div>
            <h1 className="font-medium text-white text-lg leading-tight">{me.user.name ?? "Member"}</h1>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 font-medium ${tier.bg} ${tier.color}`}>
              {tier.label}
              {isActive && " ✦"}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 py-5 pb-10">
        {/* ポイントカード */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400 tracking-wide uppercase mb-1">Points</p>
              <p className="text-5xl font-light text-[#1C1C1E] tracking-tight">
                {me.totalPoints.toLocaleString()}
                <span className="text-lg text-slate-400 ml-1">pt</span>
              </p>
            </div>
            {discount > 0 && (
              <span className="text-xs bg-[#C4962A] text-white px-2.5 py-1 rounded-full font-medium">
                {discount}% OFF
              </span>
            )}
          </div>

          {me.tier !== "gold" && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>{tier.label}</span>
                <span>次のランクまで <strong className="text-[#1C1C1E]">{ptsToNext.toLocaleString()}pt</strong></span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1">
                <div
                  className="h-1 rounded-full bg-[#C4962A] transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
          {me.tier === "gold" && (
            <p className="text-xs text-[#C4962A] tracking-wide">✦ Highest Rank</p>
          )}
        </div>

        {/* アクション */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/me/checkin" className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-[#C4962A] transition-colors shadow-sm">
            <QrCode size={22} className="text-[#1C1C1E]" />
            <span className="text-[11px] font-medium text-slate-600">Check in</span>
          </Link>
          <Link href="/me/game" className="bg-[#1C1C1E] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#2d2d2f] transition-colors shadow-sm">
            <Gamepad2 size={22} className="text-[#C4962A]" />
            <span className="text-[11px] font-medium text-white">Game</span>
          </Link>
          <Link href="/subscribe" className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-[#C4962A] transition-colors shadow-sm">
            <CreditCard size={22} className="text-[#1C1C1E]" />
            <span className="text-[11px] font-medium text-slate-600">{isActive ? "Plan" : "Join"}</span>
          </Link>
        </div>

        {/* 特典バナー */}
        {discount > 0 && (
          <div className="bg-[#1C1C1E] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#C4962A] tracking-widest uppercase mb-0.5">Your Benefit</p>
              <p className="text-white font-medium">全メニュー {discount}% OFF</p>
              {isActive && <p className="text-xs text-white/50 mt-0.5">毎月 {SUBSCRIPTION_PLANS[me.subscriptionPlan as "silver" | "gold"]?.points}pt プレゼント</p>}
            </div>
            <span className="text-3xl">✦</span>
          </div>
        )}

        {/* 履歴 */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-50">
            <h3 className="text-xs font-medium text-slate-400 tracking-widest uppercase">History</h3>
          </div>
          {me.pointsTransactions.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-10">まだ履歴がありません</p>
          ) : (
            <ul>
              {me.pointsTransactions.slice(0, 8).map((t, i) => (
                <li key={t.id} className={`flex justify-between px-4 py-3.5 ${i !== 0 ? "border-t border-slate-50" : ""}`}>
                  <div>
                    <p className="text-sm text-[#1C1C1E]">{t.description ?? t.type}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(t.createdAt).toLocaleDateString("ja-JP")}</p>
                  </div>
                  <span className={`text-sm font-medium self-center ${t.points > 0 ? "text-[#C4962A]" : "text-slate-400"}`}>
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
