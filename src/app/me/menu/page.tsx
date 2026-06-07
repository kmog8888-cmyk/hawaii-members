"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus, Minus, ShoppingBag } from "lucide-react";

type MenuItem = {
  id: string; name: string; nameEn: string | null; price: number;
  description: string | null; imageUrl: string | null; category: string; available: boolean;
};
type CartItem = MenuItem & { quantity: number };

const CATEGORIES: Record<string, { label: string; emoji: string }> = {
  drinks:   { label: "Drinks",   emoji: "☕" },
  food:     { label: "Food",     emoji: "🍽" },
  sweets:   { label: "Sweets",   emoji: "🍰" },
  specials: { label: "Specials", emoji: "⭐" },
};

export default function MenuPage() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [note, setNote] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [ordering, setOrdering] = useState(false);

  // 15分刻みの受け取り時間スロット生成（今から15分後〜90分後）
  const timeSlots = (() => {
    const slots: { value: string; label: string }[] = [{ value: "asap", label: "できるだけ早く" }];
    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15 + 15, 0, 0);
    for (let i = 0; i < 6; i++) {
      const t = new Date(now.getTime() + i * 15 * 60000);
      const h = t.getHours();
      const m = String(t.getMinutes()).padStart(2, "0");
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      slots.push({ value: `${h}:${m}`, label: `${h12}:${m} ${ampm}` });
    }
    return slots;
  })();

  useEffect(() => {
    fetch("/api/menu").then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) setItems(d.filter((i) => i.available !== false));
      setLoading(false);
    });
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (existing?.quantity === 1) return prev.filter((c) => c.id !== id);
      return prev.map((c) => c.id === id ? { ...c, quantity: c.quantity - 1 } : c);
    });
  };

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);
  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  const checkout = async () => {
    setOrdering(true);
    // セッション情報取得
    const meRes = await fetch("/api/me");
    const me = meRes.ok ? await meRes.json() : null;

    // 注文作成
    const orderRes = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((c) => ({ menuItemId: c.id, name: c.name, price: c.price, quantity: c.quantity })),
        note,
        pickupTime: pickupTime || "asap",
        customerId: me?.id || null,
        customerName: me?.user?.name || null,
        customerEmail: me?.user?.email || null,
      }),
    });
    const order = await orderRes.json();

    // Stripe Checkout
    const stripeRes = await fetch("/api/stripe/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });
    const { url } = await stripeRes.json();
    if (url) window.location.href = url;
    else setOrdering(false);
  };

  const categories = ["all", ...Array.from(new Set(items.map((i) => i.category)))];
  const filtered = activeCategory === "all" ? items : items.filter((i) => i.category === activeCategory);

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#BFE96A] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] max-w-sm mx-auto pb-32">
      {/* ヘッダー */}
      <div className="px-5 pt-14 pb-5">
        <Link href="/me" className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 mb-5">
          <ChevronLeft size={14} /> マイページ
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] tracking-[0.3em] text-[#BFE96A] uppercase mb-1">Alohabake &amp; cafe</p>
            <h1 className="text-3xl font-light text-white tracking-tight">Menu</h1>
          </div>
          {cartCount > 0 && (
            <button onClick={() => setShowCart(true)} className="relative mt-1 bg-[#BFE96A] text-[#0f0f0f] p-2.5 rounded-xl hover:bg-[#d4f086] transition-colors">
              <ShoppingBag size={20} />
              <span className="absolute -top-1.5 -right-1.5 bg-[#0f0f0f] text-[#BFE96A] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-[#BFE96A]">
                {cartCount}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* カテゴリタブ */}
      <div className="flex gap-2 px-5 mb-5 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const info = CATEGORIES[cat];
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat ? "bg-[#BFE96A] text-[#0f0f0f]" : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}>
              {cat === "all" ? "All" : info ? `${info.emoji} ${info.label}` : cat}
            </button>
          );
        })}
      </div>

      {/* メニューアイテム */}
      <div className="px-5 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/20">
            <p className="text-4xl mb-3">🍽</p>
            <p className="text-sm">メニューがありません</p>
          </div>
        )}
        {filtered.map((item) => {
          const qty = cart.find((c) => c.id === item.id)?.quantity ?? 0;
          return (
            <div key={item.id} className="bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden flex">
              {item.imageUrl && (
                <div className="w-24 h-24 flex-shrink-0">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-white text-sm leading-tight">{item.name}</p>
                      {item.nameEn && <p className="text-[10px] text-white/30 mt-0.5">{item.nameEn}</p>}
                    </div>
                    <p className="text-[#BFE96A] font-semibold text-sm whitespace-nowrap">${item.price.toFixed(2)}</p>
                  </div>
                  {item.description && (
                    <p className="text-xs text-white/30 mt-1 leading-relaxed line-clamp-2">{item.description}</p>
                  )}
                </div>
                <div className="flex items-center justify-end mt-3">
                  {qty === 0 ? (
                    <button onClick={() => addToCart(item)}
                      className="flex items-center gap-1.5 bg-[#BFE96A] text-[#0f0f0f] px-3 py-1.5 rounded-full text-xs font-bold hover:bg-[#d4f086] transition-colors">
                      <Plus size={12} /> 追加
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-white/5 rounded-full px-1 py-1">
                      <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-white">
                        <Minus size={12} />
                      </button>
                      <span className="text-white text-sm font-semibold w-4 text-center">{qty}</span>
                      <button onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center text-[#BFE96A] hover:text-[#d4f086]">
                        <Plus size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* カートバー */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-xs z-40">
          <button onClick={() => setShowCart(true)}
            className="w-full bg-[#BFE96A] text-[#0f0f0f] font-bold py-4 rounded-2xl flex items-center justify-between px-5 shadow-xl hover:bg-[#d4f086] transition-colors">
            <span className="bg-[#0f0f0f]/20 text-[#0f0f0f] text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{cartCount}</span>
            <span>注文を確認する</span>
            <span className="font-bold">${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* カートモーダル */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCart(false)} />
          <div className="relative w-full max-w-sm mx-auto bg-[#1a1a1a] rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
            <h3 className="text-white font-semibold text-lg mb-4">注文内容</h3>

            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/5 rounded-full px-1 py-1">
                      <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white">
                        <Minus size={11} />
                      </button>
                      <span className="text-white text-sm w-4 text-center">{item.quantity}</span>
                      <button onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center text-[#BFE96A]">
                        <Plus size={11} />
                      </button>
                    </div>
                    <p className="text-white text-sm">{item.name}</p>
                  </div>
                  <p className="text-[#BFE96A] text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 mb-4 space-y-3">
              {/* 受け取り時間 */}
              <div>
                <p className="text-[10px] text-white/30 tracking-widest uppercase mb-2">受け取り時間</p>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.value}
                      onClick={() => setPickupTime(slot.value)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium transition-colors text-left ${
                        (pickupTime || "asap") === slot.value
                          ? "bg-[#BFE96A] text-[#0f0f0f]"
                          : "bg-white/5 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* メモ */}
              <textarea
                value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="メモ（アレルギー・要望など）"
                rows={2}
                className="w-full bg-[#0f0f0f] border border-white/10 text-white text-sm rounded-xl px-4 py-3 placeholder-white/20 focus:outline-none focus:border-[#BFE96A]/50 resize-none"
              />
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-white/50 text-sm">合計</span>
              <span className="text-white font-bold text-xl">${cartTotal.toFixed(2)}</span>
            </div>

            <button onClick={checkout} disabled={ordering}
              className="w-full bg-[#BFE96A] text-[#0f0f0f] font-bold py-4 rounded-2xl hover:bg-[#d4f086] transition-colors disabled:opacity-50">
              {ordering ? "処理中..." : "カードで支払う →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
