"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { QrCode, CreditCard, Gamepad2, LogOut, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { TIER_DISCOUNT, SUBSCRIPTION_PLANS } from "@/lib/tier";

type Me = {
  id: string; tier: string; totalPoints: number;
  subscriptionPlan: string | null; subscriptionStatus: string | null;
  user: { name: string | null; email: string | null; image: string | null };
  pointsTransactions: { id: string; points: number; type: string; description: string | null; createdAt: string }[];
};

const tierConfig = {
  bronze: { label: "Bronze", color: "text-amber-700",   bg: "bg-amber-50",    border: "border-amber-200" },
  silver: { label: "Silver", color: "text-slate-500",   bg: "bg-slate-100",   border: "border-slate-200" },
  gold:   { label: "Gold",   color: "text-[#1C1C1E]",   bg: "bg-[#C4A07A]",   border: "border-[#C4A07A]" },
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
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-[#C4A07A] border-t-[#1C1C1E] rounded-full animate-spin" />
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
      <div className="bg-white px-5 pt-14 pb-6 border-b border-[#E8E8E8]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] tracking-[0.3em] text-[#C4A07A] uppercase font-bold">Alohabake &amp; cafe</p>
            <p className="text-[10px] tracking-[0.15em] text-[#ABABAB] uppercase">Kaka'ako</p>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-[#ABABAB] hover:text-[#6B6B6B] transition-colors">
            <LogOut size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {me.user.image
            ? <img src={me.user.image} alt="" className="w-11 h-11 rounded-full border border-[#E8E8E8]" />
            : <div className="w-11 h-11 rounded-full bg-[#C4A07A] flex items-center justify-center text-[#1C1C1E] font-bold text-base">
                {me.user.name?.[0] ?? "A"}
              </div>
          }
          <div>
            <h1 className="font-semibold text-[#1C1C1E] text-base">{me.user.name ?? "Member"}</h1>
            <span className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full mt-0.5 font-semibold ${tier.bg} ${tier.color}`}>
              {tier.label}{isActive && " ✦"}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3 pb-10">
        {/* ポイントカード */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E8E8]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] tracking-widest text-[#ABABAB] uppercase mb-1">Points</p>
              <p className="text-5xl font-light text-[#1C1C1E] tracking-tighter">
                {me.totalPoints.toLocaleString()}
                <span className="text-base text-[#ABABAB] ml-1">pt</span>
              </p>
            </div>
            {discount > 0 && (
              <div className="bg-[#C4A07A] text-[#1C1C1E] text-xs font-bold px-2.5 py-1 rounded-full">
                {discount}% OFF
              </div>
            )}
          </div>

          {me.tier !== "gold" ? (
            <div>
              <div className="flex justify-between text-[10px] text-[#ABABAB] mb-1.5 tracking-wide">
                <span>{tier.label.toUpperCase()}</span>
                <span>{next.name.toUpperCase()} まで {ptsToNext.toLocaleString()}pt</span>
              </div>
              <div className="w-full bg-[#F0F0F0] rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-[#C4A07A] transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-[#C4A07A] font-bold tracking-widest uppercase">✦ Top Rank</p>
          )}
        </div>

        {/* アクション */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { href: "/me/checkin", icon: QrCode,          label: "Check in", style: "bg-white border border-[#E8E8E8] text-[#1C1C1E]" },
            { href: "/me/menu",    icon: UtensilsCrossed, label: "Menu",     style: "bg-[#C4A07A] text-[#1C1C1E]" },
            { href: "/me/game",    icon: Gamepad2,        label: "Game",     style: "bg-white border border-[#E8E8E8] text-[#1C1C1E]" },
            { href: "/subscribe",  icon: CreditCard,      label: isActive ? "Plan" : "Join", style: "bg-white border border-[#E8E8E8] text-[#1C1C1E]" },
          ].map(({ href, icon: Icon, label, style }) => (
            <Link key={href} href={href} className={`rounded-2xl p-3 flex flex-col items-center gap-2 hover:opacity-80 transition-opacity ${style}`}>
              <Icon size={20} />
              <span className="text-[9px] font-semibold tracking-wide uppercase">{label}</span>
            </Link>
          ))}
        </div>

        {/* 特典バナー */}
        {discount > 0 && (
          <div className="bg-[#1C1C1E] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#C4A07A] tracking-widest uppercase mb-0.5">Your Benefit</p>
              <p className="text-white font-medium text-sm">全メニュー {discount}% OFF</p>
              {isActive && <p className="text-xs text-white/40 mt-0.5">毎月 {SUBSCRIPTION_PLANS[me.subscriptionPlan as "silver" | "gold"]?.points}pt プレゼント</p>}
            </div>
            <span className="text-[#C4A07A] text-2xl">✦</span>
          </div>
        )}

        {/* 履歴 */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#F0F0F0]">
            <h3 className="text-[10px] tracking-widest text-[#ABABAB] uppercase font-medium">History</h3>
          </div>
          {me.pointsTransactions.length === 0 ? (
            <p className="text-center text-[#ABABAB] text-sm py-10">まだ履歴がありません</p>
          ) : (
            <ul>
              {me.pointsTransactions.slice(0, 8).map((t, i) => (
                <li key={t.id} className={`flex justify-between px-4 py-3.5 ${i !== 0 ? "border-t border-[#F0F0F0]" : ""}`}>
                  <div>
                    <p className="text-sm text-[#1C1C1E]">{t.description ?? t.type}</p>
                    <p className="text-[10px] text-[#ABABAB] mt-0.5">{new Date(t.createdAt).toLocaleDateString("ja-JP")}</p>
                  </div>
                  <span className={`text-sm font-semibold self-center ${t.points > 0 ? "text-green-600" : "text-[#ABABAB]"}`}>
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
