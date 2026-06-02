import { TIER_COLORS, TIER_LABELS, type Tier } from "@/lib/tier";

export default function TierBadge({ tier }: { tier: string }) {
  const t = tier as Tier;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TIER_COLORS[t]}`}>
      {TIER_LABELS[t]}
    </span>
  );
}
