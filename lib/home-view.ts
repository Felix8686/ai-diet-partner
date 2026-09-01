import type { MealKind, MealPlanItem } from "@/types";

export type HomePeriod = "morning" | "noon" | "evening";

export type HomeMeals = {
  breakfast?: MealPlanItem;
  lunch?: MealPlanItem;
  dinner?: MealPlanItem;
};

export type MorningHomeState = {
  breakfastSkipped: boolean;
  focusKind: "breakfast" | "lunch";
  showMissingBreakfast: boolean;
};

export type EveningContent = "dinner" | "missing-dinner" | "feedback";

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

export function getHomeMeals(meals: MealPlanItem[]): HomeMeals {
  return {
    breakfast: meals.find((meal) => meal.kind === "breakfast"),
    lunch: meals.find((meal) => meal.kind === "lunch"),
    dinner: meals.find((meal) => meal.kind === "dinner"),
  };
}

export function getMorningHomeState(meals: HomeMeals, breakfastPattern: string | null | undefined): MorningHomeState {
  const breakfastSkipped = breakfastPattern === "通常不吃";
  return {
    breakfastSkipped,
    focusKind: breakfastSkipped && meals.lunch ? "lunch" : "breakfast",
    showMissingBreakfast: !meals.breakfast && !breakfastSkipped,
  };
}

export function getEveningContent(hasDinner: boolean): EveningContent[] {
  return hasDinner ? ["dinner", "feedback"] : ["missing-dinner", "feedback"];
}
