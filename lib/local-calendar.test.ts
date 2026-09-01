import { strict as assert } from "node:assert";
import test from "node:test";
import {
  formatLocalDate,
  getLocalDateKey,
  getLocalWeekDates,
  getLocalWeekdayIndex,
  getLocalTodayIndex,
} from "./local-calendar";

test("2026-09-01 是周二，并选中本周第二天", () => {
  const date = new Date(2026, 8, 1, 12, 0, 0);

  assert.equal(getLocalDateKey(date), "2026-09-01");
  assert.equal(getLocalWeekdayIndex(date), 1);
  assert.equal(getLocalTodayIndex(date), 1);
});

test("从周二生成的本周日期从周一 8/31 开始", () => {
  const dates = getLocalWeekDates(new Date(2026, 8, 1, 12, 0, 0));

  assert.deepEqual(dates.map(getLocalDateKey), [
    "2026-08-31",
    "2026-09-01",
    "2026-09-02",
    "2026-09-03",
    "2026-09-04",
    "2026-09-05",
    "2026-09-06",
  ]);
  assert.equal(formatLocalDate(dates[1]), "9/1");
});

test("本地日期 key 使用设备日期，不通过 UTC 字符串截取", () => {
  const localMorning = new Date(2026, 8, 1, 0, 30, 0);
  const localNight = new Date(2026, 8, 1, 23, 59, 0);

  assert.equal(getLocalDateKey(localMorning), "2026-09-01");
  assert.equal(getLocalDateKey(localNight), "2026-09-01");
});
