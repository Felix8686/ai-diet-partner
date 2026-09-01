import { strict as assert } from "node:assert";
import test from "node:test";
import { isTodayInWeekView } from "./week-view";

test("本周真实本地日期仍标记为今天", () => {
  assert.equal(isTodayInWeekView("current", 2, 2), true);
  assert.equal(isTodayInWeekView("current", 1, 2), false);
});

test("下周默认第一天不会被标记为今天", () => {
  assert.equal(isTodayInWeekView("next", 0, 2), false);
  assert.equal(isTodayInWeekView("next", 2, 2), false);
});