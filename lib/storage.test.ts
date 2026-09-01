import { strict as assert } from "node:assert";
import test from "node:test";
import type { OnboardingProfile } from "@/types";
import { generateWeekPlan } from "./meal-planner";
import {
  STORAGE_KEYS,
  loadDailyFeedback,
  loadFeedbackForWeek,
  loadProfile,
  loadShoppingList,
  loadWeeklyPlan,
  saveDailyFeedback,
  saveProfile,
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
  likedFoods: "鸡肉",
  dislikedFoods: "",
  dietaryRestrictions: "",
  breakfastPattern: "大多数时候会吃",
  lateNightSnack: "没有",
  snackHabit: "偶尔",
  kitchenCapabilities: ["炒", "煮", "蒸", "微波"],
  shoppingPlace: "家附近超市",
};

function withStorage<T>(callback: (storage: MemoryStorage) => T): T {
  const storage = new MemoryStorage();
  const previousWindow = globalThis.window;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage: storage },
  });
  try {
    return callback(storage);
  } finally {
    if (previousWindow === undefined) Reflect.deleteProperty(globalThis, "window");
    else Object.defineProperty(globalThis, "window", { configurable: true, value: previousWindow });
  }
}

test("JSON 损坏时统一存储层安全回退", () => {
  withStorage((storage) => {
    storage.setItem(STORAGE_KEYS.profile, "{bad json");
    storage.setItem(STORAGE_KEYS.shoppingList, "not-json");

    assert.equal(loadProfile(), null);
    assert.deepEqual(loadShoppingList(), []);
    assert.equal(loadWeeklyPlan(), null);
  });
});

test("统一存储层保存并读取 profile、方案、采购和反馈", () => {
  withStorage((storage) => {
    const plan = generateWeekPlan(profile, "2026-09-07");
    const shopping = [{ id: "ingredient-鸡肉", category: "蛋白质", name: "鸡肉", amount: "2 份", purchased: false }];
    const feedback = { executionStatus: "partial" as const, snackLevel: "none" as const, deviationReasons: ["没时间"], otherReason: "" };

    saveProfile(profile);
    saveWeeklyPlan(plan);
    saveShoppingList(plan.weekStart, shopping);
    shopping[0].purchased = true;
    saveShoppingList(plan.weekStart, shopping);
    saveDailyFeedback("2026-09-01", feedback);

    assert.deepEqual(loadProfile(), profile);
    assert.deepEqual(loadWeeklyPlan(plan.weekStart), plan);
    assert.equal(loadShoppingList(plan.weekStart)[0]?.purchased, true);
    const storedFeedback = loadDailyFeedback("2026-09-01");
    assert.equal(storedFeedback?.executionStatus, feedback.executionStatus);
    assert.equal(storedFeedback?.date, "2026-09-01");
    assert.equal(typeof storedFeedback?.submittedAt, "number");
    assert.equal(storage.getItem(STORAGE_KEYS.feedback("2026-09-01")) !== null, true);
  });
});

test("旧版周方案仍可读取，但无法验证安全性的替换方案会隐藏", () => {
  withStorage((storage) => {
    const plan = generateWeekPlan(profile, "2026-09-07");
    const legacyPlan = JSON.parse(JSON.stringify(plan));
    delete legacyPlan.days[0].meals[0].dietaryTags;
    delete legacyPlan.days[0].meals[0].shoppingItems;
    legacyPlan.days[0].meals[0].alternatives = ["未验证的替换方案"];
    storage.setItem(STORAGE_KEYS.weeklyPlan, JSON.stringify(legacyPlan));

    const loaded = loadWeeklyPlan();
    assert.ok(loaded);
    assert.deepEqual(loaded.days[0].meals[0].dietaryTags, []);
    assert.deepEqual(loaded.days[0].meals[0].alternatives, []);
  });
});

test("本周和下周方案、采购清单按 weekStart 独立保存", () => {
  withStorage(() => {
    const currentPlan = generateWeekPlan(profile, "2026-09-07");
    const nextPlan = generateWeekPlan(profile, "2026-09-14");
    const currentItems = [{ id: "current", category: "其他", name: "本周食材", amount: "1 份", purchased: true }];
    const nextItems = [{ id: "next", category: "其他", name: "下周食材", amount: "2 份", purchased: false }];

    saveWeeklyPlan(currentPlan);
    saveWeeklyPlan(nextPlan);
    saveShoppingList(currentPlan.weekStart, currentItems);
    saveShoppingList(nextPlan.weekStart, nextItems);

    assert.equal(loadWeeklyPlan(currentPlan.weekStart)?.weekStart, currentPlan.weekStart);
    assert.equal(loadWeeklyPlan(nextPlan.weekStart)?.weekStart, nextPlan.weekStart);
    assert.equal(loadShoppingList(currentPlan.weekStart)[0]?.purchased, true);
    assert.equal(loadShoppingList(nextPlan.weekStart)[0]?.purchased, false);
  });
});

test("旧版单周方案和采购清单只在周起点匹配时迁移", () => {
  withStorage((storage) => {
    const legacyPlan = generateWeekPlan(profile, "2026-09-07");
    const legacyItems = [{ id: "legacy", category: "其他", name: "旧版食材", amount: "1 份", purchased: true }];
    storage.setItem(STORAGE_KEYS.weeklyPlan, JSON.stringify(legacyPlan));
    storage.setItem(STORAGE_KEYS.shoppingList, JSON.stringify(legacyItems));

    assert.equal(loadWeeklyPlan("2026-09-07")?.weekStart, "2026-09-07");
    assert.equal(storage.getItem(STORAGE_KEYS.weeklyPlanForWeek("2026-09-07")) !== null, true);
    assert.equal(loadShoppingList("2026-09-07")[0]?.name, "旧版食材");
    assert.equal(storage.getItem(STORAGE_KEYS.shoppingListForWeek("2026-09-07")) !== null, true);
    assert.equal(loadWeeklyPlan("2026-09-14"), null);
    assert.deepEqual(loadShoppingList("2026-09-14"), []);
  });
});

test("按本地周日期读取反馈，不混入相邻周", () => {
  withStorage(() => {
    saveDailyFeedback("2026-09-07", { executionStatus: "partial", snackLevel: "none", deviationReasons: ["没时间"], otherReason: "" });
    saveDailyFeedback("2026-09-13", { executionStatus: "completed", snackLevel: "little", deviationReasons: [], otherReason: "" });
    saveDailyFeedback("2026-09-14", { executionStatus: "partial", snackLevel: "more", deviationReasons: ["太贵"], otherReason: "" });

    const current = loadFeedbackForWeek("2026-09-07");
    const next = loadFeedbackForWeek("2026-09-14");
    assert.deepEqual(current.map((entry) => entry.date), ["2026-09-07", "2026-09-13"]);
    assert.deepEqual(next.map((entry) => entry.date), ["2026-09-14"]);
  });
});
