import { strict as assert } from "node:assert";
import test from "node:test";
import type { MealPlanItem } from "@/types";
import * as homeView from "./home-view";
import { getHomeMealKinds, getHomeMeals, getHomePeriod, getMorningHomeState, getNextMealState } from "./home-view";

function minimalMeal(kind: MealPlanItem["kind"], id: string): MealPlanItem {
  return { id, kind, title: id, scene: "", prepMinutes: 0, kitchenCapabilities: [], estimatedCost: 0, ingredients: [], shoppingItems: [], tags: [], dietaryTags: [], alternatives: [] };
}

test("把早晨聚焦在早餐，并预览午餐和晚餐", () => {
  assert.equal(getHomePeriod(8), "morning");
  assert.deepEqual(getHomeMealKinds("morning"), ["breakfast", "lunch", "dinner"]);
});

test("中午先展示午餐，再安排晚餐", () => {
  assert.equal(getHomePeriod(12), "noon");
  assert.deepEqual(getHomeMealKinds("noon"), ["lunch", "dinner"]);
});

test("晚上聚焦晚餐，并提供每日反馈入口", () => {
  assert.equal(getHomePeriod(19), "evening");
  assert.deepEqual(getHomeMealKinds("evening"), ["dinner"]);
});

test("首页缺少一个餐别时仍保留其他餐别", () => {
  const meals = getHomeMeals([minimalMeal("breakfast", "breakfast-1"), minimalMeal("lunch", "lunch-1")]);
  assert.equal(meals?.breakfast?.id, "breakfast-1");
  assert.equal(meals?.lunch?.id, "lunch-1");
  assert.equal(meals?.dinner, undefined);
});

test("通常不吃早餐时早晨跳过早餐缺失提示并聚焦午餐", () => {
  const state = getMorningHomeState(getHomeMeals([minimalMeal("lunch", "lunch-1")]), "通常不吃");
  assert.deepEqual(state, { breakfastSkipped: true, focusKind: "lunch", showMissingBreakfast: false });
});

test("正常早餐用户确实缺少模板时保留早餐缺失提示", () => {
  const state = getMorningHomeState(getHomeMeals([minimalMeal("lunch", "lunch-1")]), "大多数时候会吃");
  assert.deepEqual(state, { breakfastSkipped: false, focusKind: "breakfast", showMissingBreakfast: true });
});

test("晚间没有晚餐时仍保留每日反馈入口", () => {
  const getEveningContent = (homeView as typeof homeView & { getEveningContent?: (hasDinner: boolean) => Array<"dinner" | "missing-dinner" | "feedback"> }).getEveningContent;
  assert.ok(getEveningContent);
  assert.deepEqual(getEveningContent?.(false), ["missing-dinner", "feedback"]);
  assert.deepEqual(getEveningContent?.(true), ["dinner", "feedback"]);
});

test("午餐时段首页直接聚焦午餐，不依赖早上 tab", () => {
  const state = getNextMealState([minimalMeal("breakfast", "b"), minimalMeal("lunch", "l"), minimalMeal("dinner", "d")], 12, "大多数时候会吃");
  assert.equal(state.nextMeal?.id, "l");
  assert.equal(state.previewMeal?.id, "d");
  assert.equal(state.label, "下一顿 · 午餐");
});

test("15 点午餐后首页直接聚焦晚餐", () => {
  const state = getNextMealState([minimalMeal("breakfast", "b"), minimalMeal("lunch", "l"), minimalMeal("dinner", "d")], 15, "大多数时候会吃");
  assert.equal(state.nextMeal?.id, "d");
  assert.equal(state.label, "下一顿 · 晚餐");
});

test("通常不吃早餐时早上下一顿直接是午餐", () => {
  const state = getNextMealState([minimalMeal("lunch", "l"), minimalMeal("dinner", "d")], 8, "通常不吃");
  assert.equal(state.nextMeal?.id, "l");
  assert.equal(state.label, "下一顿 · 午餐");
});

test("晚餐后不再制造下一顿晚餐", () => {
  const state = getNextMealState([minimalMeal("dinner", "d")], 21, "大多数时候会吃");
  assert.equal(state.afterDinner, true);
  assert.equal(state.nextMeal, undefined);
});