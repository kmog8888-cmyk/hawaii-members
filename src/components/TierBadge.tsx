const TIER_STYLES: Record<string, string> = {
  bronze: "bg-amber-50 text-amber-700 border border-amber-200",
  silver: "bg-slate-50 text-slate-600 border border-slate-200",
  gold:   "bg-yellow-50 text-[#C4962A] border border-yellow-200",
};

export default function TierBadge({ tier }: { tier: string }) {
  const label = tier.charAt(0).toUpperCase() + tier.slice(1);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TIER_STYLES[tier] ?? TIER_STYLES.bronze}`}>
      {label}
    </span>
  );
}
