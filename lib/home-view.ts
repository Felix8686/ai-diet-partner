import type { MealKind } from "@/types";

export type HomePeriod = "morning" | "noon" | "evening";

export function getHomePeriod(hour: number): HomePeriod {
  const normalizedHour = ((hour % 24) + 24) % 24;

  if (normalizedHour >= 5 && normalizedHour < 11) return "morning";
  if (normalizedHour >= 11 && normalizedHour < 17) return "noon";
  return "evening";
}

export function getHomeMealKinds(period: HomePeriod): MealKind[] {
  if (period === "morning") return ["breakfast", "lunch", "dinner"];
  if (period === "noon") return ["lunch", "dinner"];
  return ["dinner"];
}
