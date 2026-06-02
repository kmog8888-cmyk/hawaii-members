export type Tier = "bronze" | "silver" | "gold";

export function calcTier(points: number, subscriptionPlan?: string | null): Tier {
  if (subscriptionPlan === "gold") return "gold";
  if (subscriptionPlan === "silver") return "silver";
  if (points >= 2000) return "gold";
  if (points >= 500) return "silver";
  return "bronze";
}

export const TIER_LABELS: Record<Tier, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
};

export const TIER_COLORS: Record<Tier, string> = {
  bronze: "bg-amber-100 text-amber-800",
  silver: "bg-slate-100 text-slate-700",
  gold: "bg-yellow-100 text-yellow-800",
};

export const SUBSCRIPTION_PLANS = {
  silver: { name: "Silver Plan", price: 9.99, points: 100, discount: 5 },
  gold:   { name: "Gold Plan",   price: 19.99, points: 300, discount: 10 },
};
