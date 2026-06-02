"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Mail, CreditCard, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/customers", label: "会員管理", icon: Users },
  { href: "/campaigns", label: "メール配信", icon: Mail },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="px-6 py-5 border-b border-slate-700">
        <p className="text-xs text-slate-400 uppercase tracking-widest">🌺 Hawaii Restaurant</p>
        <h1 className="text-lg font-bold mt-0.5">会員システム</h1>
      </div>
      <nav className="flex-1 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                active ? "bg-slate-700 text-white font-medium" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-700">
        <Link href="/account" className="flex items-center gap-3 px-6 py-4 text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <User size={18} />
          マイアカウント
        </Link>
      </div>
      <div className="px-6 py-4 border-t border-slate-700 text-xs text-slate-500 space-y-1">
        <div className="flex items-center gap-1"><CreditCard size={11} /> Silver $9.99/月 · 5% OFF</div>
        <div className="flex items-center gap-1"><CreditCard size={11} /> Gold $19.99/月 · 10% OFF</div>
      </div>
    </aside>
  );
}
