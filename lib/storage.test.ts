import { strict as assert } from "node:assert";
import test from "node:test";
import type { OnboardingProfile } from "@/types";
import { generateWeekPlan } from "./meal-planner";
import {
  STORAGE_KEYS,
  loadDailyFeedback,
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
    saveShoppingList(shopping);
    shopping[0].purchased = true;
    saveShoppingList(shopping);
    saveDailyFeedback("2026-09-01", feedback);

    assert.deepEqual(loadProfile(), profile);
    assert.deepEqual(loadWeeklyPlan(), plan);
    assert.equal(loadShoppingList()[0]?.purchased, true);
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
    legacyPlan.days[0].meals[0].alternatives = ["未验证的替换方案"];
    storage.setItem(STORAGE_KEYS.weeklyPlan, JSON.stringify(legacyPlan));

    const loaded = loadWeeklyPlan();
    assert.ok(loaded);
    assert.deepEqual(loaded.days[0].meals[0].dietaryTags, []);
    assert.deepEqual(loaded.days[0].meals[0].alternatives, []);
  });
});
