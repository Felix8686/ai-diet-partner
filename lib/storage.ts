import type { GeneratedWeekPlan, MealPlanItem, OnboardingProfile, ShoppingItem, StoredFeedback } from "@/types";
import { getLocalWeekDates, getLocalDateKey, parseLocalDateKey } from "@/lib/local-calendar";

export const STORAGE_KEYS = {
  profile: "ai-diet-profile",
  weeklyPlan: "ai-diet-weekly-plan",
  weeklyPlanForWeek: (weekStart: string) => `ai-diet-weekly-plan-${weekStart}`,
  shoppingList: "ai-diet-shopping-list",
  shoppingListForWeek: (weekStart: string) => `ai-diet-shopping-list-${weekStart}`,
  feedback: (date: string) => `ai-diet-feedback-${date}`,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isProfile(value: unknown): value is OnboardingProfile {
  return isRecord(value)
    && typeof value.age === "string"
    && typeof value.sex === "string"
    && typeof value.heightCm === "string"
    && typeof value.weightKg === "string"
    && typeof value.goal === "string"
    && typeof value.weeklyFoodBudget === "string"
    && typeof value.weekdayCookTime === "string"
    && typeof value.weekdayWeekendDifference === "string"
    && typeof value.outsideMealRatio === "string"
    && Array.isArray(value.mealScenes)
    && typeof value.likedFoods === "string"
    && typeof value.dislikedFoods === "string"
    && typeof value.dietaryRestrictions === "string"
    && typeof value.breakfastPattern === "string"
    && typeof value.lateNightSnack === "string"
    && typeof value.snackHabit === "string"
    && Array.isArray(value.kitchenCapabilities)
    && typeof value.shoppingPlace === "string";
}

function isMeal(value: unknown): value is MealPlanItem {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.kind === "string"
    && typeof value.title === "string"
    && typeof value.scene === "string"
    && typeof value.prepMinutes === "number"
    && Array.isArray(value.kitchenCapabilities)
    && typeof value.estimatedCost === "number"
    && Array.isArray(value.ingredients)
    && (value.shoppingItems === undefined || Array.isArray(value.shoppingItems))
    && Array.isArray(value.tags)
    && (value.dietaryTags === undefined || Array.isArray(value.dietaryTags))
    && Array.isArray(value.alternatives);
}

function isWeeklyPlan(value: unknown): value is GeneratedWeekPlan {
  return isRecord(value)
    && typeof value.weekStart === "string"
    && Array.isArray(value.days)
    && value.days.every((day) => isRecord(day) && typeof day.day === "string" && typeof day.date === "string" && Array.isArray(day.meals) && day.meals.every(isMeal))
    && typeof value.strategy === "string"
    && typeof value.estimatedCost === "number"
    && (value.budget === null || typeof value.budget === "number")
    && typeof value.rulesCannotSatisfy === "boolean"
    && (value.status === "ready" || value.status === "rules-cannot-satisfy")
    && Array.isArray(value.warnings);
}

function isShoppingItem(value: unknown): value is ShoppingItem {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.category === "string"
    && typeof value.name === "string"
    && typeof value.amount === "string"
    && typeof value.purchased === "boolean"
    && (value.price === undefined || typeof value.price === "number");
}

function isFeedback(value: unknown): value is Omit<StoredFeedback, "date" | "submittedAt"> & Partial<Pick<StoredFeedback, "date" | "submittedAt">> {
  return isRecord(value)
    && (value.executionStatus === "completed" || value.executionStatus === "partial" || value.executionStatus === "skipped")
    && (value.snackLevel === "none" || value.snackLevel === "little" || value.snackLevel === "more")
    && Array.isArray(value.deviationReasons)
    && (value.otherReason === undefined || typeof value.otherReason === "string")
    && (value.date === undefined || typeof value.date === "string")
    && (value.submittedAt === undefined || typeof value.submittedAt === "number");
}

function normalizeWeeklyPlan(plan: GeneratedWeekPlan): GeneratedWeekPlan {
  return {
    ...plan,
    days: plan.days.map((day) => ({
      ...day,
      meals: day.meals.map((meal) => {
        const shoppingItems = Array.isArray(meal.shoppingItems)
          ? meal.shoppingItems
          : meal.scene.includes("便利店")
            ? meal.ingredients
            : ["公司食堂", "外卖", "外食"].some((providedScene) => meal.scene.includes(providedScene))
              ? []
              : meal.ingredients;
        return Array.isArray(meal.dietaryTags)
          ? { ...meal, shoppingItems }
          : { ...meal, dietaryTags: [], alternatives: [], shoppingItems };
      }),
    })),
  };
}

function readJson(key: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable or full; the UI can continue with in-memory state.
  }
}

export function loadProfile(): OnboardingProfile | null {
  const value = readJson(STORAGE_KEYS.profile);
  return isProfile(value) ? value : null;
}

export function saveProfile(profile: OnboardingProfile): void {
  writeJson(STORAGE_KEYS.profile, profile);
}

function readWeeklyPlanAtKey(key: string): GeneratedWeekPlan | null {
  const value = readJson(key);
  return isWeeklyPlan(value) ? normalizeWeeklyPlan(value) : null;
}

function readLegacyWeeklyPlan(): GeneratedWeekPlan | null {
  return readWeeklyPlanAtKey(STORAGE_KEYS.weeklyPlan);
}

export function loadWeeklyPlan(weekStart?: string): GeneratedWeekPlan | null {
  if (weekStart) {
    const keyedPlan = readWeeklyPlanAtKey(STORAGE_KEYS.weeklyPlanForWeek(weekStart));
    if (keyedPlan?.weekStart === weekStart) return keyedPlan;
  }

  const legacyPlan = readLegacyWeeklyPlan();
  if (!legacyPlan || (weekStart && legacyPlan.weekStart !== weekStart)) return null;
  if (weekStart) writeJson(STORAGE_KEYS.weeklyPlanForWeek(weekStart), legacyPlan);
  return legacyPlan;
}

export function saveWeeklyPlan(plan: GeneratedWeekPlan): void {
  writeJson(STORAGE_KEYS.weeklyPlanForWeek(plan.weekStart), plan);
}

export function loadShoppingList(weekStart?: string): ShoppingItem[] {
  if (weekStart) {
    const keyedValue = readJson(STORAGE_KEYS.shoppingListForWeek(weekStart));
    if (Array.isArray(keyedValue) && keyedValue.every(isShoppingItem)) return keyedValue;

    const legacyPlan = readLegacyWeeklyPlan();
    const legacyValue = readJson(STORAGE_KEYS.shoppingList);
    if (legacyPlan?.weekStart === weekStart && Array.isArray(legacyValue) && legacyValue.every(isShoppingItem)) {
      writeJson(STORAGE_KEYS.shoppingListForWeek(weekStart), legacyValue);
      return legacyValue;
    }
    return [];
  }

  const value = readJson(STORAGE_KEYS.shoppingList);
  return Array.isArray(value) && value.every(isShoppingItem) ? value : [];
}

export function saveShoppingList(items: ShoppingItem[]): void;
export function saveShoppingList(weekStart: string, items: ShoppingItem[]): void;
export function saveShoppingList(weekStartOrItems: string | ShoppingItem[], maybeItems?: ShoppingItem[]): void {
  if (typeof weekStartOrItems === "string") {
    writeJson(STORAGE_KEYS.shoppingListForWeek(weekStartOrItems), maybeItems ?? []);
    return;
  }
  writeJson(STORAGE_KEYS.shoppingList, weekStartOrItems);
}

export function loadDailyFeedback(date: string): StoredFeedback | null {
  const value = readJson(STORAGE_KEYS.feedback(date));
  if (!isFeedback(value)) return null;
  return {
    executionStatus: value.executionStatus,
    snackLevel: value.snackLevel,
    deviationReasons: value.deviationReasons.filter((reason): reason is string => typeof reason === "string"),
    otherReason: value.otherReason ?? "",
    date: value.date ?? date,
    submittedAt: value.submittedAt ?? 0,
  };
}

export function saveDailyFeedback(date: string, feedback: StoredFeedback | Omit<StoredFeedback, "date" | "submittedAt">): void {
  writeJson(STORAGE_KEYS.feedback(date), {
    ...feedback,
    date,
    submittedAt: "submittedAt" in feedback ? feedback.submittedAt : Date.now(),
  });
}

export function loadFeedbackForWeek(weekStart: string): StoredFeedback[] {
  const startDate = parseLocalDateKey(weekStart);
  if (!startDate) return [];
  return getLocalWeekDates(startDate)
    .map((date) => getLocalDateKey(date))
    .map((date) => loadDailyFeedback(date))
    .filter((feedback): feedback is StoredFeedback => feedback !== null);
}
