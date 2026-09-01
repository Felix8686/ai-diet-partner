export type MealKind = "breakfast" | "lunch" | "dinner" | "snack";

export type MealPlanItem = {
  id: string;
  kind: MealKind;
  title: string;
  scene?: string;
  timeHint?: string;
  prepMinutes?: number;
  note?: string;
  alternatives?: string[];
};

export type DayPlan = {
  day: string;
  date: string;
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
