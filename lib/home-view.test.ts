import { strict as assert } from "node:assert";
import test from "node:test";
import { getHomeMealKinds, getHomePeriod } from "./home-view";

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
