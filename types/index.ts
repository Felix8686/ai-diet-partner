export type MealKind = "breakfast" | "lunch" | "dinner" | "snack";

export type MealPlanItem = {
  id: string;
  kind: MealKind;
  title: string;
  scene: string;
  timeHint?: string;
  prepMinutes: number;
  note?: string;
  alternatives: string[];
};

export type DayPlan = {
  day: string;
  meals: MealPlanItem[];
};

export type ShoppingItem = {
  id: string;
  category: string;
  name: string;
  amount: string;
  price?: number;
  purchased: boolean;
};

export type Goal = "减脂" | "增肌" | "保持" | "改善健康";

export type OnboardingProfile = {
  age: string;
  sex: string;
  heightCm: string;
  weightKg: string;
  goal: Goal;
  weeklyFoodBudget: string;
  weekdayCookTime: string;
  weekdayWeekendDifference: string;
  outsideMealRatio: string;
  mealScenes: string[];
  likedFoods: string;
  dislikedFoods: string;
  dietaryRestrictions: string;
  breakfastPattern: string;
  lateNightSnack: string;
  snackHabit: string;
  kitchenCapabilities: string[];
  shoppingPlace: string;
};

export type ExecutionStatus = "completed" | "partial" | "skipped";
export type SnackLevel = "none" | "little" | "more";

export type FeedbackDraft = {
  executionStatus: ExecutionStatus | "";
  snackLevel: SnackLevel | "";
  deviationReasons: string[];
  otherReason: string;
};
