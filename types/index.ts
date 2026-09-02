export type MealKind = "breakfast" | "lunch" | "dinner" | "snack";

export type ShoppingRequirement = {
  name: string;
  quantity: number;
  unit: string;
};

export type CostSource = "user" | "reference";

export type MealTemplate = {
  id: string;
  kind: MealKind;
  title: string;
  scene: string;
  timeHint?: string;
  prepMinutes: number;
  kitchenCapabilities: string[];
  estimatedCost: number;
  ingredients: string[];
  shoppingItems: Array<ShoppingRequirement | string>;
  tags: string[];
  dietaryTags: string[];
  note?: string;
  alternatives: string[];
  resolvedCost?: number;
  costSource?: CostSource;
};

export type MealPlanItem = MealTemplate;

export type DayPlan = {
  day: string;
  date: string;
  meals: MealPlanItem[];
};

export type GeneratedWeekPlan = {
  weekStart: string;
  days: DayPlan[];
  strategy: string;
  estimatedCost: number;
  budget: number | null;
  rulesCannotSatisfy: boolean;
  status: "ready" | "rules-cannot-satisfy";
  warnings: string[];
  adjustmentSummary?: string[];
  containsReferenceEstimates?: boolean;
  userPricedMeals?: number;
  referencePricedMeals?: number;
};

export type ShoppingItem = {
  id: string;
  category: string;
  name: string;
  amount: string;
  quantity?: number;
  unit?: string;
  price?: number;
  purchased: boolean;
};

export type Goal = "减脂" | "增肌" | "保持" | "改善健康";

export type OnboardingProfile = {
  age: string;
  sex: string;
  heightCm: string;
  weightKg: string;
  /** New profiles use goals. goal remains readable for Round 05 localStorage compatibility. */
  goals?: Goal[];
  goal?: Goal;
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

export type FoodEnvironmentKind = "ingredient" | "prepared-meal";
export type FoodAvailability = "稳定能买到" | "通常能买到" | "不太稳定";

export type FoodEnvironmentItem = {
  id: string;
  kind: FoodEnvironmentKind;
  name: string;
  scene?: string;
  quantity: number;
  unit: string;
  price: number;
  place?: string;
  availability: FoodAvailability;
};

export type ExecutionStatus = "completed" | "partial" | "skipped";
export type SnackLevel = "none" | "little" | "more";

export type FeedbackDraft = {
  executionStatus: ExecutionStatus | "";
  snackLevel: SnackLevel | "";
  deviationReasons: string[];
  otherReason: string;
};

export type StoredFeedback = FeedbackDraft & {
  date: string;
  submittedAt: number;
};

export type FeedbackReason = "没时间" | "太麻烦" | "买不到" | "太贵" | "不喜欢" | "临时聚餐" | "其他";

export type FeedbackAdjustment = {
  feedbackCount: number;
  reasonCounts: Record<FeedbackReason, number>;
  timePressure: number;
  simplicity: number;
  availability: number;
  costSensitivity: number;
  dislikedMealIds: string[];
  explanations: string[];
};
