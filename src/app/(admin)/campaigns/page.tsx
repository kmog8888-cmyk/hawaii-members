"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Send, FileText } from "lucide-react";

type Campaign = {
  id: string; subject: string; targetTier: string; status: string;
  sentAt: string | null; createdAt: string; _count: { emailLogs: number };
};

const tierLabel: Record<string, string> = { all: "全会員", bronze: "Bronze", silver: "Silver", gold: "Gold" };

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [sending, setSending] = useState<string | null>(null);

  const load = () => fetch("/api/campaigns").then((r) => r.json()).then((d) => {
    if (Array.isArray(d)) setCampaigns(d);
  });
  useEffect(() => { load(); }, []);

  const send = async (id: string) => {
    if (!confirm("このキャンペーンを送信しますか？")) return;
    setSending(id);
    const res = await fetch(`/api/campaigns/${id}/send`, { method: "POST" });
    const data = await res.json();
    setSending(null);
    alert(`${data.sent}件に送信しました`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">メールキャンペーン</h2>
        <Link href="/campaigns/new" className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700">
          <Plus size={16} /> 作成
        </Link>
      </div>

      <div className="space-y-4">
        {campaigns.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-slate-400">
            <FileText size={32} className="mx-auto mb-2 opacity-30" />
            <p>キャンペーンがありません</p>
          </div>
        )}
        {campaigns.map((c) => (
          <div key={c.id} className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-800">{c.subject}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "sent" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                  {c.status === "sent" ? "送信済" : "下書き"}
                </span>
              </div>
              <p className="text-sm text-slate-500">
                対象: {tierLabel[c.targetTier]}
                {c.status === "sent" && ` · ${c._count.emailLogs}件`}
                {c.sentAt && ` · ${new Date(c.sentAt).toLocaleDateString("ja-JP")}`}
              </p>
            </div>
            {c.status !== "sent" && (
              <button onClick={() => send(c.id)} disabled={sending === c.id}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-500 disabled:opacity-50">
                <Send size={14} />
                {sending === c.id ? "送信中..." : "送信"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
