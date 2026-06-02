"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Star, Plus, Minus } from "lucide-react";
import TierBadge from "@/components/TierBadge";

type Transaction = { id: string; points: number; type: string; description: string | null; createdAt: string };
type Customer = {
  id: string; tier: string; totalPoints: number; phone: string | null; birthday: string | null;
  subscriptionPlan: string | null; subscriptionStatus: string | null; createdAt: string;
  user: { name: string | null; email: string | null; image: string | null };
  pointsTransactions: Transaction[];
};

const typeLabel: Record<string, string> = { earn: "付与", redeem: "利用", manual: "手動", subscription: "サブスク" };

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [modal, setModal] = useState<"earn" | "redeem" | null>(null);
  const [pts, setPts] = useState("");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => fetch(`/api/customers/${id}`).then((r) => r.json()).then(setCustomer);
  useEffect(() => { load(); }, [id]);

  const addPoints = async () => {
    if (!pts || !modal) return;
    setSubmitting(true);
    await fetch(`/api/customers/${id}/points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points: Number(pts), type: modal, description: desc }),
    });
    setModal(null); setPts(""); setDesc(""); setSubmitting(false);
    load();
  };

  if (!customer) return <div className="text-slate-400 text-sm animate-pulse">読み込み中...</div>;

  return (
    <div className="max-w-2xl">
      <Link href="/customers" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ChevronLeft size={16} /> 会員一覧に戻る
      </Link>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4 mb-5">
          {customer.user.image && (
            <img src={customer.user.image} alt="" className="w-14 h-14 rounded-full object-cover" />
          )}
          <div>
            <h2 className="text-xl font-bold text-slate-800">{customer.user.name ?? "—"}</h2>
            <p className="text-slate-500 text-sm">{customer.user.email ?? "—"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-5">
          <div><span className="text-slate-400">ランク: </span><TierBadge tier={customer.tier} /></div>
          <div><span className="text-slate-400">電話: </span>{customer.phone ?? "—"}</div>
          <div>
            <span className="text-slate-400">サブスク: </span>
            {customer.subscriptionStatus === "active" ? (
              <span className="text-green-600 font-medium">{customer.subscriptionPlan === "gold" ? "Gold" : "Silver"} 有効</span>
            ) : "無料プラン"}
          </div>
          <div><span className="text-slate-400">登録: </span>{new Date(customer.createdAt).toLocaleDateString("ja-JP")}</div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star size={20} className="text-yellow-500" />
            <span className="text-2xl font-bold text-slate-800">{customer.totalPoints.toLocaleString()}</span>
            <span className="text-slate-500 text-sm">ポイント</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setModal("earn")} className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-500">
              <Plus size={14} /> 付与
            </button>
            <button onClick={() => setModal("redeem")} className="flex items-center gap-1.5 bg-orange-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-orange-400">
              <Minus size={14} /> 利用
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100"><h3 className="font-semibold text-slate-700">ポイント履歴</h3></div>
        {customer.pointsTransactions.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-10">履歴がありません</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {customer.pointsTransactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-6 py-3 text-sm">
                <div>
                  <span className="text-slate-700">{typeLabel[t.type] ?? t.type}</span>
                  {t.description && <span className="text-slate-400 ml-2">— {t.description}</span>}
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(t.createdAt).toLocaleString("ja-JP")}</p>
                </div>
                <span className={`font-semibold ${t.points > 0 ? "text-green-600" : "text-red-500"}`}>
                  {t.points > 0 ? "+" : ""}{t.points}pt
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
            <h4 className="font-semibold text-slate-800 mb-4">{modal === "earn" ? "ポイント付与" : "ポイント利用"}</h4>
            <div className="space-y-3">
              <input type="number" min="1" value={pts} onChange={(e) => setPts(e.target.value)} placeholder="ポイント数"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="メモ（任意）"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setModal(null)} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm hover:bg-slate-50">キャンセル</button>
              <button onClick={addPoints} disabled={!pts || submitting}
                className={`flex-1 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 ${modal === "earn" ? "bg-green-600 hover:bg-green-500" : "bg-orange-500 hover:bg-orange-400"}`}>
                {submitting ? "処理中..." : modal === "earn" ? "付与する" : "利用する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
