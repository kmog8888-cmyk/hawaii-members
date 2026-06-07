"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const CATEGORIES = [
  { value: "drinks",   label: "☕ Drinks" },
  { value: "food",     label: "🍽 Food" },
  { value: "sweets",   label: "🍰 Sweets" },
  { value: "specials", label: "⭐ Specials" },
];

export default function NewMenuItemPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", nameEn: "", price: "", description: "", imageUrl: "", category: "food" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.push("/menu");
  };

  return (
    <div className="max-w-lg">
      <Link href="/menu" className="flex items-center gap-1 text-sm text-white/30 hover:text-white/60 mb-6">
        <ChevronLeft size={16} /> メニュー一覧に戻る
      </Link>
      <h2 className="text-2xl font-bold text-white mb-6">アイテム追加</h2>

      <form onSubmit={submit} className="bg-[#1a1a1a] rounded-2xl p-6 space-y-4 border border-white/5">
        {error && <p className="text-red-400 text-sm bg-red-900/20 rounded-xl px-3 py-2">{error}</p>}

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs text-white/40 mb-1.5 tracking-wide uppercase">商品名 *</label>
            <input type="text" required value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="アサイーボウル" className="w-full bg-[#0f0f0f] border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-[#C4A07A]/50" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-white/40 mb-1.5 tracking-wide uppercase">英語名</label>
            <input type="text" value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)}
              placeholder="Acai Bowl" className="w-full bg-[#0f0f0f] border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-[#C4A07A]/50" />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5 tracking-wide uppercase">価格 ($) *</label>
            <input type="number" required step="0.01" min="0" value={form.price} onChange={(e) => set("price", e.target.value)}
              placeholder="12.00" className="w-full bg-[#0f0f0f] border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-[#C4A07A]/50" />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5 tracking-wide uppercase">カテゴリ</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)}
              className="w-full bg-[#0f0f0f] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C4A07A]/50">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5 tracking-wide uppercase">説明</label>
          <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)}
            placeholder="新鮮なフルーツと..." className="w-full bg-[#0f0f0f] border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-[#C4A07A]/50 resize-none" />
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5 tracking-wide uppercase">写真URL</label>
          <input type="url" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)}
            placeholder="https://..." className="w-full bg-[#0f0f0f] border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-[#C4A07A]/50" />
          {form.imageUrl && (
            <div className="mt-2 rounded-xl overflow-hidden aspect-video">
              <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
            </div>
          )}
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-[#C4A07A] text-[#0f0f0f] font-semibold py-3 rounded-xl text-sm hover:bg-[#D4B08A] transition-colors disabled:opacity-40">
          {loading ? "追加中..." : "追加する"}
        </button>
      </form>
    </div>
  );
}
