"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (result?.ok) router.push("/me");
    else setError("メールアドレスまたはパスワードが正しくありません");
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6">
      {/* ロゴ・ブランド */}
      <div className="text-center mb-10">
        <p className="text-xs tracking-[0.3em] text-[#C4962A] uppercase mb-2">Members</p>
        <h1 className="text-3xl font-light text-[#1C1C1E] tracking-wide">Alohabake <span className="font-semibold">&</span> cafe</h1>
        <p className="text-sm tracking-[0.2em] text-slate-400 mt-1 uppercase">Kaka'ako</p>
      </div>

      <div className="w-full max-w-sm">
        <form onSubmit={submitEmail} className="space-y-4">
          {error && (
            <div className="text-sm text-red-500 text-center py-2">{error}</div>
          )}
          <div>
            <input
              type="email" required value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="メールアドレス"
              className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#C4962A] transition-colors"
            />
          </div>
          <div>
            <input
              type="password" required value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="パスワード"
              className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#C4962A] transition-colors"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-[#1C1C1E] text-white py-3.5 rounded-xl text-sm font-medium tracking-wide hover:bg-[#2d2d2f] transition-colors disabled:opacity-40"
          >
            {loading ? "..." : "ログイン"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <button
          onClick={() => signIn("instagram", { callbackUrl: "/me" })}
          className="w-full flex items-center justify-center gap-2.5 border border-slate-200 bg-white py-3.5 rounded-xl text-sm text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-pink-500">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
          Instagramでログイン
        </button>

        <p className="text-center text-xs text-slate-400 mt-6">
          アカウントをお持ちでない方は{" "}
          <Link href="/register" className="text-[#C4962A] hover:underline">新規登録</Link>
        </p>
      </div>
    </div>
  );
}
