"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

const plans = [
  {
    id: "silver", name: "Silver", price: 9.99,
    color: "from-slate-400 to-slate-600",
    features: ["5% 割引", "毎月 100pt 進呈", "Silver バッジ"],
  },
  {
    id: "gold", name: "Gold", price: 19.99,
    color: "from-yellow-400 to-orange-500",
    features: ["10% 割引", "毎月 300pt 進呈", "Gold バッジ", "優先予約"],
  },
];

export default function SubscribePage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const subscribe = async (plan: string) => {
    setLoading(plan);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error ?? "エラーが発生しました");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="text-4xl mb-3">🌺</div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">プランを選択</h1>
          <p className="text-slate-500">いつでもキャンセル可能です</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className={`bg-gradient-to-br ${plan.color} p-6 text-white`}>
                <h2 className="text-2xl font-bold">{plan.name}</h2>
                <div className="mt-2">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-white/80 ml-1">/月</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <Check size={16} className="text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => subscribe(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full bg-gradient-to-r ${plan.color} text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50`}
                >
                  {loading === plan.id ? "処理中..." : `${plan.name}に登録`}
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          <button onClick={() => router.push("/dashboard")} className="hover:text-slate-600 underline">
            無料プランで続ける
          </button>
        </p>
      </div>
    </div>
  );
}
