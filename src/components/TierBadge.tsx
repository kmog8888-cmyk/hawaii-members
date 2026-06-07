const TIER_STYLES: Record<string, string> = {
  bronze: "bg-amber-50 text-amber-700 border border-amber-200",
  silver: "bg-slate-100 text-slate-500 border border-slate-200",
  gold:   "bg-[#C4A07A] text-[#1C1C1E] border border-[#C4A07A]",
};

export default function TierBadge({ tier }: { tier: string }) {
  const label = tier.charAt(0).toUpperCase() + tier.slice(1);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${TIER_STYLES[tier] ?? TIER_STYLES.bronze}`}>
      {label}
    </span>
  );
}
