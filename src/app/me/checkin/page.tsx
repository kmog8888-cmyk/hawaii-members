"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import TierBadge from "@/components/TierBadge";

export default function CheckinPage() {
  const router = useRouter();
  const [me, setMe] = useState<{ id: string; tier: string; totalPoints: number; user: { name: string | null } } | null>(null);
  const [QRCode, setQRCode] = useState<typeof import("qrcode") | null>(null);
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((r) => { if (r.status === 401) { router.push("/"); return null; } return r.json(); })
      .then((d) => { if (d) setMe(d); });

    import("qrcode").then((mod) => setQRCode(mod));
  }, []);

  useEffect(() => {
    if (!me || !QRCode) return;
    const checkinUrl = `${window.location.origin}/api/customers/${me.id}/points`;
    QRCode.toDataURL(JSON.stringify({ customerId: me.id, name: me.user.name }), {
      width: 280, margin: 2, color: { dark: "#1e293b", light: "#ffffff" }
    }).then(setQrUrl);
  }, [me, QRCode]);

  if (!me) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-4xl animate-bounce">🌺</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white max-w-sm mx-auto px-4 py-8">
      <Link href="/me" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ChevronLeft size={16} /> マイページに戻る
      </Link>

      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-slate-800">チェックインQR</h1>
        <p className="text-sm text-slate-500 mt-1">スタッフにこの画面を見せてください</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6 text-center">
        <div className="mb-4">
          <p className="font-bold text-slate-800 text-lg">{me.user.name}</p>
          <div className="flex justify-center mt-1"><TierBadge tier={me.tier} /></div>
        </div>

        {qrUrl ? (
          <img src={qrUrl} alt="QR Code" className="mx-auto rounded-2xl" width={240} height={240} />
        ) : (
          <div className="w-60 h-60 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center">
            <div className="text-4xl animate-spin">⟳</div>
          </div>
        )}

        <div className="mt-4 bg-orange-50 rounded-2xl p-3">
          <p className="text-xs text-orange-600">現在のポイント</p>
          <p className="text-2xl font-bold text-orange-700">{me.totalPoints.toLocaleString()}<span className="text-sm font-normal ml-1">pt</span></p>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-4">
        QRコードはスタッフがスキャンしてポイントを付与します
      </p>
    </div>
  );
}
