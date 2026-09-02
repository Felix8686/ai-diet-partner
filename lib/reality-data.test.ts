import { strict as assert } from "node:assert";
import test from "node:test";
import type { FoodEnvironmentItem } from "@/types";
import { mealTemplates } from "./meal-templates";
import { resolveMealCost } from "./reality-data";

function template(id: string) {
  const found = mealTemplates.find((item) => item.id === id);
  assert.ok(found);
  return found;
}

test("用户录入的外卖价格优先于模板参考估价", () => {
  const environment: FoodEnvironmentItem[] = [{
    id: "takeout-price", kind: "prepared-meal", name: "我常点的鸡肉饭", scene: "外卖", quantity: 1, unit: "份", price: 23,
    availability: "稳定能买到",
  }];
  const resolved = resolveMealCost(template("lunch-takeout-noodles"), environment);
  assert.deepEqual(resolved, { cost: 23, source: "user" });
});

test("没有用户价格时明确回退到参考估价", () => {
  const item = template("lunch-takeout-noodles");
  const resolved = resolveMealCost(item, []);
  assert.deepEqual(resolved, { cost: item.estimatedCost, source: "reference" });
});

test("家庭食材只有在名称和单位可对应时才按用户购买价格计算", () => {
  const environment: FoodEnvironmentItem[] = [
    { id: "egg", kind: "ingredient", name: "鸡蛋", quantity: 10, unit: "个", price: 10, availability: "稳定能买到" },
    { id: "tomato", kind: "ingredient", name: "番茄", quantity: 4, unit: "个", price: 8, availability: "稳定能买到" },
    { id: "noodle", kind: "ingredient", name: "面条", quantity: 500, unit: "g", price: 8, availability: "稳定能买到" },
  ];
  const resolved = resolveMealCost(template("dinner-tomato-egg-noodles"), environment);
  assert.equal(resolved.source, "user");
  assert.ok(resolved.cost > 0);
});
