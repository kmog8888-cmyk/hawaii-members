"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Star, CreditCard, LogOut } from "lucide-react";
import Link from "next/link";
import TierBadge from "@/components/TierBadge";

type Me = {
  id: string; tier: string; totalPoints: number;
  subscriptionPlan: string | null; subscriptionStatus: string | null;
  user: { name: string | null; email: string | null; image: string | null };
  pointsTransactions: { id: string; points: number; type: string; description: string | null; createdAt: string }[];
};

export default function AccountPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then(setMe);
  }, []);

  const openPortal = async () => {
    setPortalLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setPortalLoading(false);
  };

  if (!me) return <div className="min-h-screen flex items-center justify-center text-slate-400">読み込み中...</div>;

  const isActive = me.subscriptionStatus === "active";

  return (
    <div className="min-h-screen bg-slate-50 p-6 max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
        <div className="flex items-center gap-4 mb-4">
          {me.user.image && <img src={me.user.image} alt="" className="w-12 h-12 rounded-full" />}
          <div>
            <h1 className="font-bold text-slate-800">{me.user.name}</h1>
            <p className="text-sm text-slate-500">{me.user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TierBadge tier={me.tier} />
          {isActive && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {me.subscriptionPlan === "gold" ? "Gold" : "Silver"} サブスク有効
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Star size={18} className="text-yellow-500" />
          <span className="text-sm text-slate-500">ポイント残高</span>
        </div>
        <p className="text-4xl font-bold text-slate-800">{me.totalPoints.toLocaleString()}<span className="text-lg font-normal text-slate-500 ml-1">pt</span></p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
        <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <CreditCard size={16} /> サブスクリプション
        </h3>
        {isActive ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              現在のプラン: <strong>{me.subscriptionPlan === "gold" ? "Gold ($19.99/月)" : "Silver ($9.99/月)"}</strong>
            </p>
            <button onClick={openPortal} disabled={portalLoading}
              className="w-full border border-slate-200 rounded-xl py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">
              {portalLoading ? "移動中..." : "プラン変更・キャンセル"}
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-500 mb-3">現在は無料プランです</p>
            <Link href="/subscribe" className="block w-full text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2.5 rounded-xl text-sm hover:opacity-90">
              有料プランにアップグレード
            </Link>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
        <div className="px-5 py-3 border-b border-slate-100"><h3 className="font-semibold text-slate-700 text-sm">ポイント履歴</h3></div>
        {me.pointsTransactions.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-8">履歴がありません</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {me.pointsTransactions.slice(0, 10).map((t) => (
              <li key={t.id} className="flex justify-between px-5 py-3 text-sm">
                <div>
                  <span className="text-slate-700">{t.description ?? t.type}</span>
                  <p className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleDateString("ja-JP")}</p>
                </div>
                <span className={`font-semibold ${t.points > 0 ? "text-green-600" : "text-red-500"}`}>
                  {t.points > 0 ? "+" : ""}{t.points}pt
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-600 py-3"
      >
        <LogOut size={14} /> ログアウト
      </button>
    </div>
  );
}
