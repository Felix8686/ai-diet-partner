import { strict as assert } from "node:assert";
import test from "node:test";
import type { OnboardingProfile } from "@/types";
import { mealTemplates } from "./meal-templates";
import { generateWeekPlan } from "./meal-planner";
import { deriveShoppingList } from "./shopping-list";
import { aggregateFeedbackForWeek } from "./feedback-adjustments";

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

function feedback(date: string, reasons: string[]) {
  return {
    date,
    submittedAt: Date.parse(`${date}T18:00:00`),
    executionStatus: "partial" as const,
    snackLevel: "none" as const,
    deviationReasons: reasons,
    otherReason: "",
  };
}

function weekdayAveragePrep(plan: ReturnType<typeof generateWeekPlan>): number {
  const meals = plan.days.slice(0, 5).flatMap((day) => day.meals);
  return meals.reduce((total, meal) => total + meal.prepMinutes, 0) / meals.length;
}

function weekdayCost(plan: ReturnType<typeof generateWeekPlan>): number {
  return plan.days.slice(0, 5).flatMap((day) => day.meals).reduce((total, meal) => total + meal.estimatedCost, 0);
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

test("严格禁忌画像的主方案和替换方案都不会出现动物性食材", () => {
  const plan = generateWeekPlan({
    ...homeProfile,
    dietaryRestrictions: "纯素",
  }, week);
  const animalTerms = ["鸡肉", "鸡胸", "牛肉", "鱼", "虾", "虾仁", "鸡蛋", "茶叶蛋", "牛奶", "酸奶", "奶酪"];

  for (const meal of mealsOf(plan)) {
    const mealText = [meal.title, ...meal.ingredients, ...meal.alternatives].join(" ");
    assert.equal(meal.dietaryTags.includes("contains-animal"), false);
    assert.equal(animalTerms.some((term) => mealText.includes(term)), false, `${meal.title} 包含动物性食材`);
  }
});

test("替换方案也遵守工作日时间和厨房能力", () => {
  const plan = generateWeekPlan(busyProfile, week);
  const templatesByTitle = new Map(mealTemplates.map((template) => [template.title, template]));

  for (const day of plan.days.slice(0, 5)) {
    for (const meal of day.meals) {
      for (const alternative of meal.alternatives) {
        const template = templatesByTitle.get(alternative);
        assert.ok(template, `找不到替换模板：${alternative}`);
        assert.ok(template.prepMinutes <= 10);
        assert.ok(template.kitchenCapabilities.every((capability) => busyProfile.kitchenCapabilities.includes(capability)));
      }
    }
  }
});

test("替换方案也不会出现用户讨厌或禁忌食物", () => {
  const plan = generateWeekPlan({
    ...homeProfile,
    dislikedFoods: "豆腐",
    dietaryRestrictions: "花生过敏",
  }, week);
  const mealText = mealsOf(plan).map((meal) => [meal.title, ...meal.ingredients, ...meal.alternatives].join(" ")).join(" ");

  assert.equal(mealText.includes("豆腐"), false);
  assert.equal(mealText.includes("花生"), false);
});

test("对鸡蛋或牛奶过敏时主方案和替换方案都不会出现对应食材", () => {
  for (const dietaryRestrictions of ["对鸡蛋过敏", "对牛奶过敏"]) {
    const plan = generateWeekPlan({ ...homeProfile, dietaryRestrictions }, week);
    const mealText = mealsOf(plan).map((meal) => [meal.title, ...meal.ingredients, ...meal.alternatives].join(" ")).join(" ");

    if (dietaryRestrictions === "对鸡蛋过敏") {
      assert.equal(mealText.includes("鸡蛋"), false);
      assert.equal(mealText.includes("茶叶蛋"), false);
    } else {
      assert.equal(mealText.includes("牛奶"), false);
    }
  }
});

test("通常不吃早餐时不会生成固定早餐", () => {
  const plan = generateWeekPlan({ ...homeProfile, breakfastPattern: "通常不吃" }, week);

  assert.ok(plan.days.every((day) => day.meals.every((meal) => meal.kind !== "breakfast")));
});

test("有时来不及时早餐优先选择快速且无需烹饪的方案", () => {
  const plan = generateWeekPlan({ ...homeProfile, breakfastPattern: "有时来不及" }, week);
  const breakfastMeals = plan.days.flatMap((day) => day.meals.filter((meal) => meal.kind === "breakfast"));

  assert.ok(breakfastMeals.length > 0);
  assert.ok(breakfastMeals.every((meal) => meal.prepMinutes <= 5 && meal.kitchenCapabilities.length === 0));
});

test("自己带饭画像会改变工作日午餐并保留可采购食材", () => {
  const packedProfile = {
    ...homeProfile,
    mealScenes: ["自己带饭"],
    outsideMealRatio: "每周约 1–3 顿",
  };
  const outsideProfile = {
    ...packedProfile,
    mealScenes: ["公司食堂", "外卖"],
    outsideMealRatio: "大多数在外面吃",
  };
  const packedPlan = generateWeekPlan(packedProfile, week);
  const outsidePlan = generateWeekPlan(outsideProfile, week);
  const packedLunches = packedPlan.days.slice(0, 5).flatMap((day) => day.meals.filter((meal) => meal.kind === "lunch"));
  const outsideLunches = outsidePlan.days.slice(0, 5).flatMap((day) => day.meals.filter((meal) => meal.kind === "lunch"));
  const shoppingNames = new Set(deriveShoppingList(packedPlan).map((item) => item.name));
  const packedShoppingItems = new Set(
    packedLunches.flatMap((meal) => meal.shoppingItems.map((item) => typeof item === "string" ? item : item.name)),
  );

  assert.ok(packedLunches.length > 0);
  assert.ok(packedLunches.every((meal) => meal.scene.includes("自己带饭")));
  assert.ok(packedLunches.every((meal) => meal.shoppingItems.length > 0));
  assert.ok([...packedShoppingItems].every((item) => shoppingNames.has(item)));
  assert.notDeepEqual(packedLunches.map((meal) => meal.id), outsideLunches.map((meal) => meal.id));
});

test("每天时间差不多时周末继续遵守工作日准备时间上限", () => {
  const plan = generateWeekPlan({
    ...homeProfile,
    weekdayCookTime: "10 分钟以内",
    weekdayWeekendDifference: "每天时间差不多",
  }, week);
  const weekendMeals = plan.days.slice(5).flatMap((day) => day.meals);

  assert.ok(weekendMeals.every((meal) => meal.prepMinutes <= 10));
});

test("周末反而更忙时不会因周末日期放宽复杂度", () => {
  const plan = generateWeekPlan({
    ...homeProfile,
    weekdayCookTime: "10 分钟以内",
    weekdayWeekendDifference: "周末反而更忙",
  }, week);
  const weekendMeals = plan.days.slice(5).flatMap((day) => day.meals);

  assert.ok(weekendMeals.every((meal) => meal.prepMinutes <= 10));
});

test("工作日更忙且周末有时间时，周末画像会参与方案选择", () => {
  const sameSchedulePlan = generateWeekPlan({
    ...homeProfile,
    weekdayCookTime: "10 分钟以内",
    weekdayWeekendDifference: "每天时间差不多",
  }, week);
  const relaxedWeekendPlan = generateWeekPlan({
    ...homeProfile,
    weekdayCookTime: "10 分钟以内",
    weekdayWeekendDifference: "工作日更忙，周末有时间",
  }, week);

  assert.notDeepEqual(relaxedWeekendPlan.days.slice(5), sameSchedulePlan.days.slice(5));
});

test("通常不做饭不会因周末有时间而选中烹饪模板", () => {
  const plan = generateWeekPlan({
    ...homeProfile,
    weekdayCookTime: "通常不做饭",
    weekdayWeekendDifference: "工作日更忙，周末有时间",
  }, week);
  const weekendMeals = plan.days.slice(5).flatMap((day) => day.meals);

  assert.ok(weekendMeals.every((meal) => meal.kitchenCapabilities.length === 0));
});

test("没有反馈时下一周仍使用正常 planner 且结果稳定", () => {
  const source = generateWeekPlan(homeProfile, week);
  const adjustments = aggregateFeedbackForWeek([], source);
  const first = generateWeekPlan(homeProfile, "2026-09-14");
  const second = generateWeekPlan(homeProfile, "2026-09-14");

  assert.equal(adjustments.explanations.length, 0);
  assert.deepEqual(first, second);
  assert.deepEqual(first, generateWeekPlan(homeProfile, "2026-09-14", undefined));
});

test("多次没时间后下一周工作日平均准备时间可验证下降", () => {
  const source = generateWeekPlan(homeProfile, week);
  const feedbackEntries = ["2026-09-07", "2026-09-08", "2026-09-09"].map((date) => feedback(date, ["没时间"]));
  const adjustments = aggregateFeedbackForWeek(feedbackEntries, source);
  const normal = generateWeekPlan(homeProfile, "2026-09-14");
  const adjusted = generateWeekPlan(homeProfile, "2026-09-14", adjustments);

  assert.ok(weekdayAveragePrep(adjusted) < weekdayAveragePrep(normal));
  assert.match(adjusted.adjustmentSummary?.[0] ?? "", /更快/);
});

test("多次太贵后下一周在可行模板范围内成本倾向下降", () => {
  const source = generateWeekPlan(homeProfile, week);
  const feedbackEntries = ["2026-09-07", "2026-09-08", "2026-09-09"].map((date) => feedback(date, ["太贵"]));
  const adjustments = aggregateFeedbackForWeek(feedbackEntries, source);
  const normal = generateWeekPlan(homeProfile, "2026-09-14");
  const adjusted = generateWeekPlan(homeProfile, "2026-09-14", adjustments);

  assert.ok(weekdayCost(adjusted) < weekdayCost(normal));
  assert.match(adjusted.adjustmentSummary?.[0] ?? "", /更省/);
});

test("临时聚餐不会错误触发整周惩罚", () => {
  const source = generateWeekPlan(homeProfile, week);
  const adjustments = aggregateFeedbackForWeek([feedback("2026-09-07", ["临时聚餐"])], source);

  assert.equal(adjustments.timePressure, 0);
  assert.equal(adjustments.simplicity, 0);
  assert.equal(adjustments.availability, 0);
  assert.equal(adjustments.costSensitivity, 0);
  assert.deepEqual(adjustments.explanations, []);
  assert.deepEqual(generateWeekPlan(homeProfile, "2026-09-14"), generateWeekPlan(homeProfile, "2026-09-14", undefined));
});

test("不喜欢只降低相关主餐再次出现，不修改永久 dislikedFoods", () => {
  const source = generateWeekPlan(homeProfile, week);
  const adjustments = aggregateFeedbackForWeek([feedback("2026-09-07", ["不喜欢"])], source);
  const normal = generateWeekPlan(homeProfile, "2026-09-14");
  const adjusted = generateWeekPlan(homeProfile, "2026-09-14", adjustments);
  const dislikedId = adjustments.dislikedMealIds[0];

  assert.ok(dislikedId);
  assert.ok(mealsOf(normal).some((meal) => meal.id === dislikedId));
  assert.equal(mealsOf(adjusted).some((meal) => meal.id === dislikedId), false);
  assert.equal(homeProfile.dislikedFoods, "");
});

test("反馈调整不能绕过过敏、厨房能力和准备时间硬约束", () => {
  const source = generateWeekPlan(busyProfile, week);
  const adjustments = aggregateFeedbackForWeek([
    feedback("2026-09-07", ["没时间", "太麻烦", "太贵"]),
    feedback("2026-09-08", ["没时间"]),
  ], source);
  const profile = { ...busyProfile, dietaryRestrictions: "对鸡蛋过敏" };
  const adjusted = generateWeekPlan(profile, "2026-09-14", adjustments);

  for (const meal of mealsOf(adjusted)) {
    const text = [meal.title, ...meal.ingredients, ...meal.alternatives].join(" ");
    assert.equal(text.includes("鸡蛋") || text.includes("茶叶蛋"), false);
    assert.ok(meal.prepMinutes <= 10);
    assert.ok(meal.kitchenCapabilities.every((capability) => profile.kitchenCapabilities.includes(capability)));
  }
});