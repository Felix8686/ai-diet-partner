import type { MealKind, MealPlanItem } from "@/types";

export type HomePeriod = "morning" | "noon" | "evening";
export type HomeMeals = { breakfast?: MealPlanItem; lunch?: MealPlanItem; dinner?: MealPlanItem };
export type MorningHomeState = { breakfastSkipped: boolean; focusKind: "breakfast" | "lunch"; showMissingBreakfast: boolean };
export type EveningContent = "dinner" | "missing-dinner" | "feedback";

export type NextMealState = {
  nextMeal?: MealPlanItem;
  previewMeal?: MealPlanItem;
  afterDinner: boolean;
  label: string;
};

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
  return { breakfastSkipped, focusKind: breakfastSkipped && meals.lunch ? "lunch" : "breakfast", showMissingBreakfast: !meals.breakfast && !breakfastSkipped };
}

export function getEveningContent(hasDinner: boolean): EveningContent[] {
  return hasDinner ? ["dinner", "feedback"] : ["missing-dinner", "feedback"];
}

export function getNextMealState(meals: MealPlanItem[], hour: number, breakfastPattern?: string | null): NextMealState {
  const { breakfast, lunch, dinner } = getHomeMeals(meals);
  const skipBreakfast = breakfastPattern === "通常不吃";
  const normalizedHour = ((hour % 24) + 24) % 24;

  if (normalizedHour < 10 && breakfast && !skipBreakfast) {
    return { nextMeal: breakfast, previewMeal: lunch, afterDinner: false, label: "下一顿 · 早餐" };
  }
  if (normalizedHour < 14 && lunch) {
    return { nextMeal: lunch, previewMeal: dinner, afterDinner: false, label: "下一顿 · 午餐" };
  }
  if (normalizedHour < 20 && dinner) {
    return { nextMeal: dinner, afterDinner: false, label: "下一顿 · 晚餐" };
  }
  if (normalizedHour < 14 && !lunch && dinner) {
    return { nextMeal: dinner, afterDinner: false, label: "接下来 · 晚餐" };
  }
  return { afterDinner: true, label: "今天的安排到这里" };
}
