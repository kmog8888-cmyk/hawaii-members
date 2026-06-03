const TIER_STYLES: Record<string, string> = {
  bronze: "bg-[#A0623D]/20 text-[#A0623D]",
  silver: "bg-white/10 text-white/50",
  gold:   "bg-[#BFE96A] text-[#0f0f0f]",
};

export default function TierBadge({ tier }: { tier: string }) {
  const label = tier.charAt(0).toUpperCase() + tier.slice(1);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TIER_STYLES[tier] ?? TIER_STYLES.bronze}`}>
      {label}
    </span>
  );
}
