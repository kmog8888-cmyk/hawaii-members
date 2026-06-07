"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function GamePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] max-w-sm mx-auto flex flex-col">
      <div className="flex items-center justify-between px-4 pt-12 pb-3">
        <Link href="/me" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ChevronLeft size={16} /> マイページ
        </Link>
        <p className="text-xs text-slate-400">お待ちの間にどうぞ 🎮</p>
      </div>

      <div className="flex-1 mx-3 mb-4 rounded-2xl overflow-hidden shadow-lg bg-white">
        <iframe
          src="https://alohabeke-game.vercel.app"
          className="w-full h-full min-h-[80vh]"
          style={{ border: "none" }}
          allow="accelerometer; autoplay"
          title="Aloha Beke Game"
        />
      </div>
    </div>
  );
}
