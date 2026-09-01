import { strict as assert } from "node:assert";
import test from "node:test";
import type { OnboardingProfile } from "@/types";
import { generateWeekPlan } from "./meal-planner";
import { deriveShoppingList } from "./shopping-list";

const profile: OnboardingProfile = {
  age: "30",
  sex: "女",
  heightCm: "165",
  weightKg: "60",
  goal: "保持",
  weeklyFoodBudget: "500",
  weekdayCookTime: "30–60 分钟",
  weekdayWeekendDifference: "每天时间差不多",
  outsideMealRatio: "几乎都在家",
  mealScenes: ["在家吃"],
  likedFoods: "鸡肉、豆腐",
  dislikedFoods: "",
  dietaryRestrictions: "",
  breakfastPattern: "大多数时候会吃",
  lateNightSnack: "没有",
  snackHabit: "偶尔",
  kitchenCapabilities: ["炒", "煮", "蒸", "微波"],
  shoppingPlace: "家附近超市",
};

test("采购清单由生成周方案中的主要食材派生且结果稳定", () => {
  const plan = generateWeekPlan(profile, "2026-09-07");
  const first = deriveShoppingList(plan);
  const second = deriveShoppingList(plan);
  const ingredients = new Set(plan.days.flatMap((day) => day.meals.flatMap((meal) => meal.ingredients)));

  assert.deepEqual(first, second);
  assert.ok(first.length > 0);
  assert.ok(first.every((item) => item.purchased === false));
  assert.ok(first.every((item) => ingredients.has(item.name)));
});
