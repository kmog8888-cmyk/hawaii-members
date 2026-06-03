"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Mail, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Members", icon: Users },
  { href: "/campaigns", label: "Campaigns", icon: Mail },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 min-h-screen bg-[#1C1C1E] text-white flex flex-col">
      <div className="px-6 py-6 border-b border-white/10">
        <p className="text-[10px] tracking-[0.3em] text-[#C4962A] uppercase">Alohabake & cafe</p>
        <p className="text-[10px] tracking-[0.2em] text-white/30 uppercase mt-0.5">Kaka'ako</p>
        <p className="text-xs text-white/50 mt-2">Admin</p>
      </div>
      <nav className="flex-1 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                active
                  ? "text-white bg-white/10 border-r-2 border-[#C4962A]"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10">
        <Link href="/me" className="flex items-center gap-3 px-6 py-4 text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors">
          <User size={16} />
          Member View
        </Link>
      </div>
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-[10px] text-white/20">Silver $9.99 · Gold $19.99</p>
      </div>
    </aside>
  );
}
