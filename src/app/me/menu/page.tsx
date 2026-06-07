"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type MenuItem = {
  id: string; name: string; nameEn: string | null; price: number;
  description: string | null; imageUrl: string | null; category: string;
};

const CATEGORIES: Record<string, { label: string; emoji: string }> = {
  drinks:   { label: "Drinks",   emoji: "☕" },
  food:     { label: "Food",     emoji: "🍽" },
  sweets:   { label: "Sweets",   emoji: "🍰" },
  specials: { label: "Specials", emoji: "⭐" },
};

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/menu").then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) setItems(d);
      setLoading(false);
    });
  }, []);

  const available = items.filter((i) => (i as MenuItem & { available: boolean }).available !== false);
  const categories = ["all", ...Array.from(new Set(available.map((i) => i.category)))];
  const filtered = activeCategory === "all" ? available : available.filter((i) => i.category === activeCategory);

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#BFE96A] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] max-w-sm mx-auto pb-10">
      {/* ヘッダー */}
      <div className="px-5 pt-14 pb-5">
        <Link href="/me" className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 mb-5">
          <ChevronLeft size={14} /> マイページ
        </Link>
        <p className="text-[10px] tracking-[0.3em] text-[#BFE96A] uppercase mb-1">Alohabake &amp; cafe</p>
        <h1 className="text-3xl font-light text-white tracking-tight">Menu</h1>
      </div>

      {/* カテゴリタブ */}
      <div className="flex gap-2 px-5 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => {
          const info = CATEGORIES[cat];
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat ? "bg-[#BFE96A] text-[#0f0f0f]" : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}>
              {info ? `${info.emoji} ${info.label}` : "All"}
            </button>
          );
        })}
      </div>

      {/* メニューアイテム */}
      <div className="px-5 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/20">
            <p className="text-4xl mb-3">🍽</p>
            <p className="text-sm">メニューがありません</p>
          </div>
        )}
        {filtered.map((item) => (
          <div key={item.id} className="bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden flex">
            {item.imageUrl && (
              <div className="w-24 h-24 flex-shrink-0">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className={`flex-1 p-4 flex flex-col justify-between ${!item.imageUrl ? "" : ""}`}>
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-white text-sm leading-tight">{item.name}</p>
                    {item.nameEn && <p className="text-[10px] text-white/30 mt-0.5">{item.nameEn}</p>}
                  </div>
                  <p className="text-[#BFE96A] font-semibold text-sm whitespace-nowrap">${item.price.toFixed(2)}</p>
                </div>
                {item.description && (
                  <p className="text-xs text-white/30 mt-1.5 leading-relaxed line-clamp-2">{item.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
