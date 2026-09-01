import { strict as assert } from "node:assert";
import test from "node:test";
import type { GeneratedWeekPlan, MealPlanItem, StoredFeedback } from "@/types";
import { aggregateFeedbackForWeek } from "./feedback-adjustments";

function meal(kind: MealPlanItem["kind"], id: string): MealPlanItem {
  return {
    id,
    kind,
    title: id,
    scene: "家里",
    prepMinutes: 10,
    kitchenCapabilities: [],
    estimatedCost: 5,
    ingredients: [],
    shoppingItems: [],
    tags: [],
    dietaryTags: [],
    alternatives: [],
  };
}

const sourcePlan: GeneratedWeekPlan = {
  weekStart: "2026-09-07",
  days: [
    { day: "周一", date: "2026-09-07", meals: [meal("lunch", "lunch-mon"), meal("dinner", "dinner-mon")] },
    { day: "周二", date: "2026-09-08", meals: [meal("breakfast", "breakfast-tue"), meal("dinner", "dinner-tue")] },
  ],
  strategy: "",
  estimatedCost: 0,
  budget: null,
  rulesCannotSatisfy: false,
  status: "ready",
  warnings: [],
};

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

test("反馈聚合只把可解释原因转成有限调整信号", () => {
  const result = aggregateFeedbackForWeek([
    feedback("2026-09-08", ["没时间", "临时聚餐", "没时间"]),
    feedback("2026-09-07", ["太麻烦", "其他"]),
    feedback("2026-09-09", ["临时聚餐"]),
  ], sourcePlan);

  assert.equal(result.feedbackCount, 3);
  assert.equal(result.reasonCounts["没时间"], 1);
  assert.equal(result.reasonCounts["太麻烦"], 1);
  assert.equal(result.reasonCounts["临时聚餐"], 2);
  assert.equal(result.timePressure, 1);
  assert.equal(result.simplicity, 1);
  assert.equal(result.explanations.length, 2);
  assert.equal(result.explanations.some((item) => item.includes("临时聚餐")), false);
});

test("不喜欢只记录当天主餐模板，不改变其他日期或永久资料", () => {
  const result = aggregateFeedbackForWeek([
    feedback("2026-09-07", ["不喜欢"]),
    feedback("2026-09-08", ["不喜欢"]),
  ], sourcePlan);

  assert.deepEqual(result.dislikedMealIds, ["dinner-tue", "lunch-mon"]);
  assert.equal(result.explanations.length, 1);
  assert.match(result.explanations[0] ?? "", /再次出现/);
});

test("没有反馈或只有偶发聚餐时不制造调整", () => {
  const empty = aggregateFeedbackForWeek([], sourcePlan);
  const social = aggregateFeedbackForWeek([feedback("2026-09-07", ["临时聚餐"])], sourcePlan);

  assert.equal(empty.feedbackCount, 0);
  assert.equal(empty.timePressure, 0);
  assert.equal(empty.simplicity, 0);
  assert.equal(empty.availability, 0);
  assert.equal(empty.costSensitivity, 0);
  assert.deepEqual(empty.dislikedMealIds, []);
  assert.deepEqual(social.explanations, []);
});
