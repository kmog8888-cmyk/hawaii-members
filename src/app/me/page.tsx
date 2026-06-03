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

const tierLabel: Record<string, string> = { bronze: "Bronze", silver: "Silver", gold: "Gold" };
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
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#BFE96A] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!me) return null;

  const isActive = me.subscriptionStatus === "active";
  const discount = TIER_DISCOUNT[me.tier as keyof typeof TIER_DISCOUNT] ?? 0;
  const next = nextTier[me.tier as keyof typeof nextTier];
  const ptsToNext = Math.max(0, next.pts - me.totalPoints);
  const pct = me.tier === "gold" ? 100
    : me.tier === "silver" ? Math.min(100, Math.round(((me.totalPoints - 500) / 1500) * 100))
    : Math.min(100, Math.round((me.totalPoints / 500) * 100));

  return (
    <div className="min-h-screen bg-[#0f0f0f] max-w-sm mx-auto text-white">
      {/* ヘッダー */}
      <div className="px-5 pt-14 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] tracking-[0.3em] text-[#BFE96A] uppercase font-medium">Alohabake &amp; cafe</p>
            <p className="text-[10px] tracking-[0.15em] text-white/20 uppercase">Kaka'ako · Members</p>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-white/20 hover:text-white/50 transition-colors">
            <LogOut size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {me.user.image
            ? <img src={me.user.image} alt="" className="w-11 h-11 rounded-full border border-white/10" />
            : <div className="w-11 h-11 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[#BFE96A] text-lg">✦</div>
          }
          <div>
            <h1 className="font-semibold text-white text-base">{me.user.name ?? "Member"}</h1>
            <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-0.5 font-medium tracking-wide
              ${me.tier === "gold" ? "bg-[#BFE96A] text-[#0f0f0f]" : me.tier === "silver" ? "bg-white/10 text-white/60" : "bg-[#A0623D]/20 text-[#A0623D]"}`}>
              {tierLabel[me.tier]}
              {isActive && " ✦"}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-4 pb-10">
        {/* ポイントカード */}
        <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] tracking-widest text-white/30 uppercase mb-1">Points Balance</p>
              <p className="text-5xl font-light text-white tracking-tighter">
                {me.totalPoints.toLocaleString()}
                <span className="text-base text-white/30 ml-1">pt</span>
              </p>
            </div>
            {discount > 0 && (
              <div className="bg-[#BFE96A] text-[#0f0f0f] text-xs font-bold px-2.5 py-1 rounded-full">
                {discount}% OFF
              </div>
            )}
          </div>

          {me.tier !== "gold" ? (
            <div>
              <div className="flex justify-between text-[10px] text-white/30 mb-2 tracking-wide">
                <span>{tierLabel[me.tier].toUpperCase()}</span>
                <span>{next.name.toUpperCase()} まで {ptsToNext.toLocaleString()}pt</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-0.5">
                <div className="h-0.5 rounded-full bg-[#BFE96A] transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-[#BFE96A] tracking-widest uppercase">✦ Top Rank</p>
          )}
        </div>

        {/* アクションボタン */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/me/checkin" className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2.5 hover:border-[#BFE96A]/40 transition-colors">
            <QrCode size={20} className="text-white/70" />
            <span className="text-[10px] text-white/40 tracking-wide uppercase">Check in</span>
          </Link>
          <Link href="/me/game" className="bg-[#BFE96A] rounded-2xl p-4 flex flex-col items-center gap-2.5 hover:bg-[#d4f086] transition-colors">
            <Gamepad2 size={20} className="text-[#0f0f0f]" />
            <span className="text-[10px] text-[#0f0f0f] font-bold tracking-wide uppercase">Game</span>
          </Link>
          <Link href="/subscribe" className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2.5 hover:border-[#BFE96A]/40 transition-colors">
            <CreditCard size={20} className="text-white/70" />
            <span className="text-[10px] text-white/40 tracking-wide uppercase">{isActive ? "Plan" : "Join"}</span>
          </Link>
        </div>

        {/* 特典 */}
        {discount > 0 && (
          <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#BFE96A]/20 flex items-center justify-between">
            <div>
              <p className="text-[10px] tracking-widest text-[#BFE96A] uppercase mb-0.5">Your Benefit</p>
              <p className="text-white font-medium">全メニュー {discount}% OFF</p>
              {isActive && <p className="text-xs text-white/30 mt-0.5">毎月 {SUBSCRIPTION_PLANS[me.subscriptionPlan as "silver" | "gold"]?.points}pt プレゼント</p>}
            </div>
            <span className="text-[#BFE96A] text-2xl">✦</span>
          </div>
        )}

        {/* 履歴 */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-[10px] tracking-widest text-white/30 uppercase">History</h3>
          </div>
          {me.pointsTransactions.length === 0 ? (
            <p className="text-center text-white/20 text-sm py-10">まだ履歴がありません</p>
          ) : (
            <ul>
              {me.pointsTransactions.slice(0, 8).map((t, i) => (
                <li key={t.id} className={`flex justify-between px-4 py-3.5 ${i !== 0 ? "border-t border-white/5" : ""}`}>
                  <div>
                    <p className="text-sm text-white/80">{t.description ?? t.type}</p>
                    <p className="text-[10px] text-white/20 mt-0.5">{new Date(t.createdAt).toLocaleDateString("ja-JP")}</p>
                  </div>
                  <span className={`text-sm font-medium self-center ${t.points > 0 ? "text-[#BFE96A]" : "text-white/30"}`}>
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
