"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [orderNumber, setOrderNumber] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    // セッションIDから注文番号を取得
    fetch(`/api/orders?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((orders) => {
        if (Array.isArray(orders)) {
          const order = orders.find((o) => o.stripeSessionId === sessionId);
          if (order) setOrderNumber(order.orderNumber);
        }
      });
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-6">
        <CheckCircle size={64} className="text-[#BFE96A] mx-auto" strokeWidth={1.5} />
      </div>
      <p className="text-[10px] tracking-[0.3em] text-[#BFE96A] uppercase mb-2">Order Confirmed</p>
      <h1 className="text-3xl font-light text-white mb-2">ご注文ありがとうございます</h1>
      {orderNumber && (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl px-6 py-4 mt-4 mb-6">
          <p className="text-white/40 text-xs mb-1">注文番号</p>
          <p className="text-[#BFE96A] text-4xl font-bold">#{String(orderNumber).padStart(3, "0")}</p>
        </div>
      )}
      <p className="text-white/40 text-sm mb-8">準備ができましたらお呼びします</p>
      <Link href="/me" className="bg-[#BFE96A] text-[#0f0f0f] font-semibold px-8 py-3.5 rounded-2xl hover:bg-[#d4f086] transition-colors">
        マイページへ戻る
      </Link>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#BFE96A] border-t-transparent rounded-full animate-spin" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
