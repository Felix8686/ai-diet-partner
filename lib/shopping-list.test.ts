import { strict as assert } from "node:assert";
import test from "node:test";
import type { OnboardingProfile } from "@/types";
import { generateWeekPlan } from "./meal-planner";
import { deriveShoppingList, mergeShoppingListPreservingPurchased } from "./shopping-list";

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

test("食堂和外卖不进入家庭采购，便利店成品仍进入采购清单", () => {
  const outsideProfile = {
    ...profile,
    weekdayCookTime: "10 分钟以内",
    outsideMealRatio: "大多数在外面吃",
    mealScenes: ["公司食堂", "外卖", "便利店"],
    kitchenCapabilities: ["微波"],
  };
  const plan = generateWeekPlan(outsideProfile, "2026-09-07");
  const shoppingNames = new Set(deriveShoppingList(plan).map((item) => item.name));
  const providedIngredients = new Set(plan.days.flatMap((day) => day.meals
    .filter((meal) => /公司食堂|外卖|外食/.test(meal.scene))
    .flatMap((meal) => meal.ingredients)));
  const convenienceIngredients = new Set(plan.days.flatMap((day) => day.meals
    .filter((meal) => meal.scene.includes("便利店"))
    .flatMap((meal) => meal.ingredients)));
  const providedOnlyIngredients = [...providedIngredients].filter((ingredient) => !convenienceIngredients.has(ingredient));

  assert.ok(providedOnlyIngredients.length > 0);
  assert.ok(providedOnlyIngredients.every((ingredient) => !shoppingNames.has(ingredient)));
  assert.ok(convenienceIngredients.size > 0);
  assert.ok([...convenienceIngredients].some((ingredient) => shoppingNames.has(ingredient)));
});

test("更新采购清单时保留仍存在食材的已买状态", () => {
  const previousItems = [
    { id: "old-chicken", category: "蛋白质", name: "鸡肉", amount: "1 份", purchased: true },
    { id: "old-rice", category: "主食", name: "米饭", amount: "1 份", purchased: false },
    { id: "old-removed", category: "其他", name: "已移除食材", amount: "1 份", purchased: true },
  ];
  const nextItems = [
    { id: "new-chicken", category: "蛋白质", name: "鸡肉", amount: "2 份", purchased: false },
    { id: "new-greens", category: "蔬菜", name: "生菜", amount: "1 份", purchased: false },
  ];

  const merged = mergeShoppingListPreservingPurchased(previousItems, nextItems);

  assert.deepEqual(merged, [
    { id: "new-chicken", category: "蛋白质", name: "鸡肉", amount: "2 份", purchased: true },
    { id: "new-greens", category: "蔬菜", name: "生菜", amount: "1 份", purchased: false },
  ]);
});
