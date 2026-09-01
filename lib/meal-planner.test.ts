import { strict as assert } from "node:assert";
import test from "node:test";
import type { OnboardingProfile } from "@/types";
import { generateWeekPlan } from "./meal-planner";

const busyProfile: OnboardingProfile = {
  age: "32",
  sex: "男",
  heightCm: "175",
  weightKg: "72",
  goal: "减脂",
  weeklyFoodBudget: "260",
  weekdayCookTime: "10 分钟以内",
  weekdayWeekendDifference: "工作日更忙，周末有时间",
  outsideMealRatio: "大多数在外面吃",
  mealScenes: ["公司食堂", "外卖", "便利店"],
  likedFoods: "鸡肉、米饭",
  dislikedFoods: "",
  dietaryRestrictions: "",
  breakfastPattern: "有时来不及",
  lateNightSnack: "偶尔",
  snackHabit: "偶尔",
  kitchenCapabilities: ["微波"],
  shoppingPlace: "公司楼下便利店",
};

const homeProfile: OnboardingProfile = {
  age: "32",
  sex: "男",
  heightCm: "175",
  weightKg: "72",
  goal: "保持",
  weeklyFoodBudget: "500",
  weekdayCookTime: "30–60 分钟",
  weekdayWeekendDifference: "每天时间差不多",
  outsideMealRatio: "几乎都在家",
  mealScenes: ["在家吃"],
  likedFoods: "鱼、豆腐、鸡肉",
  dislikedFoods: "",
  dietaryRestrictions: "",
  breakfastPattern: "大多数时候会吃",
  lateNightSnack: "没有",
  snackHabit: "没有",
  kitchenCapabilities: ["炒", "煮", "蒸", "微波", "空气炸锅", "烤箱"],
  shoppingPlace: "家附近超市",
};

const week = "2026-09-07";

function mealsOf(plan: ReturnType<typeof generateWeekPlan>) {
  return plan.days.flatMap((day) => day.meals);
}

test("不同现实画像会生成不同的周方案", () => {
  const busyPlan = generateWeekPlan(busyProfile, week);
  const homePlan = generateWeekPlan(homeProfile, week);

  assert.notDeepEqual(busyPlan.days, homePlan.days);
  assert.ok(mealsOf(busyPlan).some((meal) => ["公司食堂", "外卖", "便利店"].some((scene) => meal.scene.includes(scene))));
  assert.ok(mealsOf(homePlan).some((meal) => meal.scene.includes("家里")));
});

test("工作日时间和厨房能力会过滤不可能的模板", () => {
  const plan = generateWeekPlan(busyProfile, week);
  const weekdayMeals = plan.days.slice(0, 5).flatMap((day) => day.meals);

  assert.ok(weekdayMeals.every((meal) => meal.prepMinutes <= 10));
  assert.ok(weekdayMeals.every((meal) => meal.kitchenCapabilities.every((capability) => busyProfile.kitchenCapabilities.includes(capability))));
});

test("讨厌和禁忌食物不会进入主方案", () => {
  const plan = generateWeekPlan({
    ...homeProfile,
    dislikedFoods: "鸡蛋",
    dietaryRestrictions: "花生过敏",
  }, week);
  const mealText = mealsOf(plan).map((meal) => `${meal.title} ${meal.ingredients.join(" ")}`).join(" ");

  assert.equal(mealText.includes("鸡蛋"), false);
  assert.equal(mealText.includes("花生"), false);
});

test("预算无法满足时明确返回规则状态，而不是静默超预算", () => {
  const plan = generateWeekPlan({ ...busyProfile, weeklyFoodBudget: "10" }, week);

  assert.equal(plan.rulesCannotSatisfy, true);
  assert.ok(plan.estimatedCost > 10);
  assert.ok(plan.warnings.length > 0);
});

test("同一用户同一周重复生成结果保持稳定", () => {
  const first = generateWeekPlan(homeProfile, week);
  const second = generateWeekPlan(homeProfile, week);

  assert.deepEqual(first, second);
});

test("缺少厨房能力时不会选中依赖该能力的模板", () => {
  const plan = generateWeekPlan({
    ...homeProfile,
    kitchenCapabilities: ["微波"],
    weekdayCookTime: "30–60 分钟",
  }, week);

  assert.ok(mealsOf(plan).every((meal) => meal.kitchenCapabilities.every((capability) => capability === "微波")));
});
