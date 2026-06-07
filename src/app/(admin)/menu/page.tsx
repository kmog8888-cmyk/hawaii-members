"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

type MenuItem = {
  id: string; name: string; nameEn: string | null; price: number;
  description: string | null; imageUrl: string | null; category: string; available: boolean;
};

const CATEGORIES: Record<string, string> = {
  drinks: "☕ Drinks", food: "🍽 Food", sweets: "🍰 Sweets", specials: "⭐ Specials",
};

export default function MenuAdminPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [filter, setFilter] = useState("all");

  const load = () => fetch("/api/menu").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setItems(d); });
  useEffect(() => { load(); }, []);

  const toggleAvailable = async (item: MenuItem) => {
    await fetch(`/api/menu/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, available: !item.available }),
    });
    load();
  };

  const deleteItem = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return;
    await fetch(`/api/menu/${id}`, { method: "DELETE" });
    load();
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.category === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Menu</h2>
        <Link href="/menu/new" className="flex items-center gap-2 bg-[#BFE96A] text-[#0f0f0f] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#d4f086] transition-colors">
          <Plus size={16} /> アイテム追加
        </Link>
      </div>

      {/* カテゴリフィルター */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[["all", "すべて"], ...Object.entries(CATEGORIES)].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === key ? "bg-[#BFE96A] text-[#0f0f0f]" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-16 text-white/20">
            <p className="text-4xl mb-3">🍽</p>
            <p>メニューがありません</p>
            <Link href="/menu/new" className="text-[#BFE96A] text-sm mt-2 inline-block hover:underline">追加する</Link>
          </div>
        )}
        {filtered.map((item) => (
          <div key={item.id} className={`bg-[#1a1a1a] rounded-2xl border overflow-hidden ${item.available ? "border-white/5" : "border-white/5 opacity-50"}`}>
            {item.imageUrl && (
              <div className="aspect-video overflow-hidden">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <p className="font-medium text-white text-sm">{item.name}</p>
                  {item.nameEn && <p className="text-xs text-white/30">{item.nameEn}</p>}
                </div>
                <p className="text-[#BFE96A] font-semibold text-sm whitespace-nowrap">${item.price.toFixed(2)}</p>
              </div>
              <p className="text-[10px] text-white/30 mb-3">{CATEGORIES[item.category] ?? item.category}</p>
              <div className="flex gap-2">
                <button onClick={() => toggleAvailable(item)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 text-xs transition-colors">
                  {item.available ? <Eye size={12} /> : <EyeOff size={12} />}
                  {item.available ? "公開中" : "非公開"}
                </button>
                <Link href={`/menu/${item.id}`} className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 transition-colors">
                  <Pencil size={14} />
                </Link>
                <button onClick={() => deleteItem(item.id, item.name)} className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-red-900/30 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
