"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewCampaignPage() {
  const router = useRouter();
  const [form, setForm] = useState({ subject: "", body: "", targetTier: "all" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: form.subject, body: form.body, targetTier: form.targetTier }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.push("/campaigns");
  };

  return (
    <div className="max-w-lg">
      <Link href="/campaigns" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ChevronLeft size={16} /> キャンペーン一覧に戻る
      </Link>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">キャンペーン作成</h2>
      <form onSubmit={submit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">送信対象</label>
          <select value={form.targetTier} onChange={(e) => set("targetTier", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
            <option value="all">全会員</option>
            <option value="bronze">Bronze のみ</option>
            <option value="silver">Silver のみ</option>
            <option value="gold">Gold のみ</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">件名 <span className="text-red-500">*</span></label>
          <input type="text" required value={form.subject} onChange={(e) => set("subject", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            placeholder="Special Offer for Our Members" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">本文 <span className="text-red-500">*</span></label>
          <textarea required rows={8} value={form.body} onChange={(e) => set("body", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
            placeholder="Aloha! 会員の皆様へ..." />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-slate-800 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50">
          {loading ? "作成中..." : "下書き保存"}
        </button>
      </form>
    </div>
  );
}
