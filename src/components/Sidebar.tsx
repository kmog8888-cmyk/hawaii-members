"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Mail, UtensilsCrossed, ShoppingBag, User } from "lucide-react";

const navItems = [
  { href: "/dashboard",  label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers",  label: "Members",   icon: Users },
  { href: "/orders",     label: "Orders",    icon: ShoppingBag },
  { href: "/menu",       label: "Menu",      icon: UtensilsCrossed },
  { href: "/campaigns",  label: "Campaigns", icon: Mail },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 min-h-screen bg-[#0f0f0f] text-white flex flex-col border-r border-white/5">
      <div className="px-6 py-6 border-b border-white/5">
        <p className="text-[10px] tracking-[0.3em] text-[#C4A07A] uppercase font-medium">Alohabake &amp; cafe</p>
        <p className="text-[10px] tracking-[0.15em] text-white/20 uppercase mt-0.5">Kaka'ako</p>
        <span className="inline-block mt-2 text-[10px] bg-white/10 text-white/40 px-2 py-0.5 rounded-full tracking-wide">Admin</span>
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
                  ? "text-[#C4A07A] bg-[#C4A07A]/5 border-r-2 border-[#C4A07A]"
                  : "text-white/30 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/5">
        <Link href="/me" className="flex items-center gap-3 px-6 py-4 text-sm text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors">
          <User size={15} />
          Member View
        </Link>
      </div>
    </aside>
  );
}
