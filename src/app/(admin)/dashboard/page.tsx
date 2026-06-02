"use client";

import { useEffect, useState } from "react";
import { Users, Star, CreditCard, TrendingUp } from "lucide-react";
import Link from "next/link";

type Stats = {
  totalCustomers: number;
  totalPoints: number;
  activeSubs: number;
  tiers: { bronze: number; silver: number; gold: number };
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then((d) => {
      if (d.totalCustomers !== undefined) setStats(d);
    });
  }, []);

  if (!stats) return <div className="text-slate-400 text-sm animate-pulse">読み込み中...</div>;

  const cards = [
    { label: "総会員数", value: stats.totalCustomers, unit: "人", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "有料サブスク", value: stats.activeSubs, unit: "人", icon: CreditCard, color: "text-green-600", bg: "bg-green-50" },
    { label: "総ポイント", value: stats.totalPoints.toLocaleString(), unit: "pt", icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">ダッシュボード</h2>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className={`${c.bg} rounded-lg p-3`}>
              <c.icon className={c.color} size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">{c.label}</p>
              <p className="text-2xl font-bold text-slate-800">
                {c.value}<span className="text-base font-normal text-slate-500 ml-1">{c.unit}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp size={18} /> ランク別会員数
          </h3>
          <div className="space-y-3">
            {[
              { label: "🥇 Gold (2000pt〜 or 有料Gold)", color: "bg-yellow-400", count: stats.tiers.gold },
              { label: "🥈 Silver (500〜1999pt or 有料Silver)", color: "bg-slate-400", count: stats.tiers.silver },
              { label: "🥉 Bronze (〜499pt)", color: "bg-amber-600", count: stats.tiers.bronze },
            ].map(({ label, color, count }) => {
              const pct = stats.totalCustomers > 0 ? Math.round((count / stats.totalCustomers) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{label}</span>
                    <span className="font-medium">{count}人</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-slate-700 mb-4">クイックアクション</h3>
          <div className="space-y-3">
            <Link href="/customers" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-slate-700 text-sm">
              <Users size={16} /> 会員一覧・ポイント付与
            </Link>
            <Link href="/campaigns/new" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-slate-700 text-sm">
              <Star size={16} /> メールキャンペーン作成
            </Link>
            <Link href="/subscribe" className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors text-purple-700 text-sm">
              <CreditCard size={16} /> サブスクプランを見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
