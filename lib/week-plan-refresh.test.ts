import { strict as assert } from "node:assert";
import test from "node:test";
import type { OnboardingProfile, ShoppingItem, StoredFeedback } from "@/types";
import { generateWeekPlan } from "./meal-planner";
import { deriveShoppingList } from "./shopping-list";
import { refreshNextWeekPlan } from "./week-plan-refresh";
import {
  loadFeedbackForWeek,
  loadShoppingList,
  loadWeeklyPlan,
  saveDailyFeedback,
  saveShoppingList,
  saveWeeklyPlan,
} from "./storage";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const profile: OnboardingProfile = {
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

const currentWeek = "2026-09-07";
const nextWeek = "2026-09-14";

function feedback(date: string, reasons: string[]): StoredFeedback {
  return {
    date,
    submittedAt: Date.parse(`${date}T18:00:00`),
    executionStatus: "partial",
    snackLevel: "none",
    deviationReasons: reasons,
    otherReason: "",
  };
}

function withStorage<T>(callback: () => T): T {
  const storage = new MemoryStorage();
  const previousWindow = globalThis.window;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage: storage },
  });
  try {
    return callback();
  } finally {
    if (previousWindow === undefined) Reflect.deleteProperty(globalThis, "window");
    else Object.defineProperty(globalThis, "window", { configurable: true, value: previousWindow });
  }
}

test("下周已有方案时可用最新反馈更新并安全保留采购状态", () => {
  withStorage(() => {
    const currentPlan = generateWeekPlan(profile, currentWeek);
    const currentShopping: ShoppingItem[] = [{
      id: "current-protected",
      category: "其他",
      name: "本周已买食材",
      amount: "1 份",
      purchased: true,
    }];
    saveWeeklyPlan(currentPlan);
    saveShoppingList(currentWeek, currentShopping);

    saveDailyFeedback("2026-09-08", feedback("2026-09-08", ["临时聚餐"]));
    const initial = refreshNextWeekPlan(profile, currentPlan, nextWeek, loadFeedbackForWeek(currentWeek), []);
    assert.equal(initial.hasEffectiveAdjustments, false);
    assert.equal(initial.plan.adjustmentSummary, undefined);
    assert.deepEqual(initial.shoppingList, deriveShoppingList(initial.plan));
    saveWeeklyPlan(initial.plan);
    saveShoppingList(nextWeek, initial.shoppingList);

    saveDailyFeedback("2026-09-09", feedback("2026-09-09", ["不喜欢"]));
    const preview = refreshNextWeekPlan(profile, currentPlan, nextWeek, loadFeedbackForWeek(currentWeek), loadShoppingList(nextWeek));
    const retainedName = initial.shoppingList.find((item) => preview.shoppingList.some((nextItem) => nextItem.name === item.name))?.name;
    assert.ok(retainedName);
    saveShoppingList(nextWeek, initial.shoppingList.map((item) => item.name === retainedName ? { ...item, purchased: true } : item));

    const updated = refreshNextWeekPlan(profile, currentPlan, nextWeek, loadFeedbackForWeek(currentWeek), loadShoppingList(nextWeek));
    saveWeeklyPlan(updated.plan);
    saveShoppingList(nextWeek, updated.shoppingList);

    assert.equal(updated.hasEffectiveAdjustments, true);
    assert.equal(updated.adjustments.feedbackCount, 2);
    assert.equal(updated.adjustments.reasonCounts["不喜欢"], 1);
    assert.match(updated.plan.adjustmentSummary?.[0] ?? "", /不喜欢/);
    assert.notDeepEqual(updated.plan.days, initial.plan.days);
    assert.equal(updated.shoppingList.find((item) => item.name === retainedName)?.purchased, true);
    assert.ok(updated.shoppingList.some((item) => !initial.shoppingList.some((oldItem) => oldItem.name === item.name) && !item.purchased));
    assert.deepEqual(loadWeeklyPlan(currentWeek), currentPlan);
    assert.deepEqual(loadShoppingList(currentWeek), currentShopping);

    const repeated = refreshNextWeekPlan(profile, currentPlan, nextWeek, loadFeedbackForWeek(currentWeek), loadShoppingList(nextWeek));
    assert.deepEqual(repeated, updated);
  });
});