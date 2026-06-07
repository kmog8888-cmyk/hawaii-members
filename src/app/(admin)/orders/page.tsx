"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";

type OrderItem = { id: string; name: string; quantity: number; price: number };
type Order = {
  id: string; orderNumber: number | null; status: string; total: number;
  customerName: string | null; note: string | null; pickupTime: string | null; createdAt: string;
  items: OrderItem[];
  customer: { user: { name: string | null } } | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; next: string | null; nextLabel: string | null }> = {
  pending:   { label: "未払い",  color: "bg-yellow-500/20 text-yellow-400", next: null,        nextLabel: null },
  paid:      { label: "受付済",  color: "bg-blue-500/20 text-blue-400",     next: "preparing", nextLabel: "調理開始" },
  preparing: { label: "調理中",  color: "bg-orange-500/20 text-orange-400", next: "ready",     nextLabel: "完成" },
  ready:     { label: "受渡可",  color: "bg-[#C4A07A]/20 text-[#C4A07A]",  next: "completed", nextLabel: "渡し済" },
  completed: { label: "完了",    color: "bg-white/10 text-white/40",        next: null,        nextLabel: null },
  cancelled: { label: "キャンセル", color: "bg-red-500/20 text-red-400",   next: null,        nextLabel: null },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("active");
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/orders").then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) setOrders(d);
      setLoading(false);
    });
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const filtered = orders.filter((o) =>
    filter === "active" ? ["paid", "preparing", "ready"].includes(o.status) :
    filter === "all" ? true : o.status === filter
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Orders</h2>
        <button onClick={load} className={`text-white/30 hover:text-white/60 transition-colors ${loading ? "animate-spin" : ""}`}>
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {[["active", "対応中"], ["all", "すべて"], ["completed", "完了"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === k ? "bg-[#C4A07A] text-[#0f0f0f]" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/20">
            <p className="text-4xl mb-2">🛍</p>
            <p className="text-sm">注文がありません</p>
          </div>
        )}
        {filtered.map((order) => {
          const st = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
          return (
            <div key={order.id} className={`bg-[#1a1a1a] border rounded-2xl p-4 ${order.status === "ready" ? "border-[#C4A07A]/30" : "border-white/5"}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-bold text-lg">
                      #{order.orderNumber ? String(order.orderNumber).padStart(3, "0") : "—"}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                  </div>
                  <p className="text-white/30 text-xs mt-0.5">
                    {order.customerName ?? "ゲスト"} · 注文 {new Date(order.createdAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {order.pickupTime && (
                    <p className={`text-xs font-semibold mt-1 ${order.pickupTime === "asap" ? "text-orange-400" : "text-[#C4A07A]"}`}>
                      🕐 受け取り: {order.pickupTime === "asap" ? "できるだけ早く" : order.pickupTime}
                    </p>
                  )}
                </div>
                <p className="text-[#C4A07A] font-bold">${order.total.toFixed(2)}</p>
              </div>

              <ul className="text-sm text-white/60 space-y-0.5 mb-3">
                {order.items.map((item) => (
                  <li key={item.id}>× {item.quantity} {item.name}</li>
                ))}
              </ul>

              {order.note && (
                <p className="text-xs text-white/40 bg-white/5 rounded-xl px-3 py-2 mb-3">📝 {order.note}</p>
              )}

              {st.next && (
                <button onClick={() => updateStatus(order.id, st.next!)}
                  className="w-full bg-[#C4A07A] text-[#0f0f0f] font-semibold py-2.5 rounded-xl text-sm hover:bg-[#D4B08A] transition-colors">
                  {st.nextLabel}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
