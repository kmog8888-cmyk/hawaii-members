"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Star } from "lucide-react";
import TierBadge from "@/components/TierBadge";

type Customer = {
  id: string;
  tier: string;
  totalPoints: number;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
  createdAt: string;
  user: { name: string | null; email: string | null; image: string | null };
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [tierFilter, setTierFilter] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tierFilter) params.set("tier", tierFilter);
    fetch(`/api/customers?${params}`).then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) setCustomers(d);
    });
  }, [q, tierFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">会員管理</h2>
        <p className="text-sm text-slate-500">Instagramでログインすると自動登録されます</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm mb-6 p-4 flex gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="名前・メールで検索"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="">全ランク</option>
          <option value="bronze">Bronze</option>
          <option value="silver">Silver</option>
          <option value="gold">Gold</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">会員</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">ランク</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">サブスク</th>
              <th className="text-right px-6 py-3 text-slate-500 font-medium">ポイント</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">登録日</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400">会員が見つかりません</td></tr>
            )}
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <Link href={`/customers/${c.id}`} className="flex items-center gap-3 hover:text-blue-600">
                    {c.user.image && (
                      <img src={c.user.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                    )}
                    <div>
                      <p className="font-medium text-slate-800">{c.user.name ?? "—"}</p>
                      <p className="text-xs text-slate-400">{c.user.email ?? "—"}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4"><TierBadge tier={c.tier} /></td>
                <td className="px-6 py-4">
                  {c.subscriptionStatus === "active" ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {c.subscriptionPlan === "gold" ? "Gold" : "Silver"} 有効
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">無料</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="flex items-center justify-end gap-1 font-medium text-slate-800">
                    <Star size={13} className="text-yellow-500" />
                    {c.totalPoints.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{new Date(c.createdAt).toLocaleDateString("ja-JP")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
