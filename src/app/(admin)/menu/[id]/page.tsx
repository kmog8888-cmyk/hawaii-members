"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const CATEGORIES = [
  { value: "drinks",   label: "☕ Drinks" },
  { value: "food",     label: "🍽 Food" },
  { value: "sweets",   label: "🍰 Sweets" },
  { value: "specials", label: "⭐ Specials" },
];

export default function EditMenuItemPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", nameEn: "", price: "", description: "", imageUrl: "", category: "food", available: true });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/menu").then((r) => r.json()).then((items) => {
      const item = items.find((i: { id: string }) => i.id === id);
      if (item) setForm({ name: item.name, nameEn: item.nameEn ?? "", price: String(item.price), description: item.description ?? "", imageUrl: item.imageUrl ?? "", category: item.category, available: item.available });
    });
  }, [id]);

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await fetch(`/api/menu/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: Number(form.price) }),
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
      <h2 className="text-2xl font-bold text-white mb-6">メニュー編集</h2>

      <form onSubmit={submit} className="bg-[#1a1a1a] rounded-2xl p-6 space-y-4 border border-white/5">
        {error && <p className="text-red-400 text-sm bg-red-900/20 rounded-xl px-3 py-2">{error}</p>}

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wide">商品名 *</label>
            <input type="text" required value={form.name} onChange={(e) => set("name", e.target.value)}
              className="w-full bg-[#0f0f0f] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#BFE96A]/50" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wide">英語名</label>
            <input type="text" value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)}
              className="w-full bg-[#0f0f0f] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#BFE96A]/50" />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wide">価格 ($)</label>
            <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => set("price", e.target.value)}
              className="w-full bg-[#0f0f0f] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#BFE96A]/50" />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wide">カテゴリ</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)}
              className="w-full bg-[#0f0f0f] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#BFE96A]/50">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wide">説明</label>
          <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)}
            className="w-full bg-[#0f0f0f] border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-[#BFE96A]/50 resize-none" />
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wide">写真URL</label>
          <input type="url" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)}
            className="w-full bg-[#0f0f0f] border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-[#BFE96A]/50" />
          {form.imageUrl && (
            <div className="mt-2 rounded-xl overflow-hidden aspect-video">
              <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
            </div>
          )}
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <div className={`w-10 h-5 rounded-full transition-colors ${form.available ? "bg-[#BFE96A]" : "bg-white/10"}`}
            onClick={() => set("available", !form.available)}>
            <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${form.available ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
          <span className="text-sm text-white/60">{form.available ? "公開中" : "非公開"}</span>
        </label>

        <button type="submit" disabled={loading}
          className="w-full bg-[#BFE96A] text-[#0f0f0f] font-semibold py-3 rounded-xl text-sm hover:bg-[#d4f086] transition-colors disabled:opacity-40">
          {loading ? "保存中..." : "保存する"}
        </button>
      </form>
    </div>
  );
}
