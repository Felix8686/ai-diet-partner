import type { CostSource, FoodEnvironmentItem, MealTemplate, ShoppingRequirement } from "@/types";

const defaults: Record<string, ShoppingRequirement> = {
  "鸡蛋": { name: "鸡蛋", quantity: 1, unit: "个" },
  "茶叶蛋": { name: "茶叶蛋", quantity: 1, unit: "个" },
  "鸡胸肉": { name: "鸡胸肉", quantity: 150, unit: "g" },
  "鸡肉": { name: "鸡肉", quantity: 150, unit: "g" },
  "牛肉": { name: "牛肉", quantity: 150, unit: "g" },
  "鱼": { name: "鱼", quantity: 180, unit: "g" },
  "虾仁": { name: "虾仁", quantity: 120, unit: "g" },
  "豆腐": { name: "豆腐", quantity: 200, unit: "g" },
  "蔬菜": { name: "蔬菜", quantity: 200, unit: "g" },
  "青菜": { name: "青菜", quantity: 200, unit: "g" },
  "生菜": { name: "生菜", quantity: 150, unit: "g" },
  "冷冻蔬菜": { name: "冷冻蔬菜", quantity: 200, unit: "g" },
  "冷冻混合蔬菜": { name: "冷冻混合蔬菜", quantity: 200, unit: "g" },
  "西兰花": { name: "西兰花", quantity: 180, unit: "g" },
  "番茄": { name: "番茄", quantity: 2, unit: "个" },
  "蘑菇": { name: "蘑菇", quantity: 120, unit: "g" },
  "米饭": { name: "大米", quantity: 80, unit: "g" },
  "即食米饭": { name: "即食米饭", quantity: 1, unit: "盒" },
  "燕麦片": { name: "燕麦片", quantity: 50, unit: "g" },
  "燕麦": { name: "燕麦片", quantity: 50, unit: "g" },
  "面条": { name: "面条", quantity: 100, unit: "g" },
  "米粉": { name: "米粉", quantity: 100, unit: "g" },
  "全麦面包": { name: "全麦面包", quantity: 2, unit: "片" },
  "全麦三明治": { name: "全麦三明治", quantity: 1, unit: "个" },
  "玉米": { name: "玉米", quantity: 1, unit: "根" },
  "无糖酸奶": { name: "无糖酸奶", quantity: 1, unit: "杯" },
  "牛奶": { name: "牛奶", quantity: 1, unit: "瓶" },
  "无糖牛奶": { name: "无糖牛奶", quantity: 1, unit: "瓶" },
  "无糖豆浆": { name: "无糖豆浆", quantity: 1, unit: "瓶" },
  "奶酪": { name: "奶酪", quantity: 1, unit: "片" },
  "苹果": { name: "苹果", quantity: 1, unit: "个" },
  "香蕉": { name: "香蕉", quantity: 1, unit: "根" },
  "坚果": { name: "坚果", quantity: 25, unit: "g" },
};

export function defaultRequirementForIngredient(name: string): ShoppingRequirement {
  return defaults[name] ?? { name, quantity: 1, unit: "份" };
}

export function structuredRequirements(items: Array<ShoppingRequirement | string>): ShoppingRequirement[] {
  return items.map((item) => typeof item === "string" ? defaultRequirementForIngredient(item) : item);
}

function normalize(value: string): string {
  return value.replace(/[：:+（()）\s]/g, "").toLowerCase();
}

function sceneParts(scene: string): string[] {
  return scene.split(/[ /／、]+/).filter(Boolean);
}

function ingredientUnitCost(item: FoodEnvironmentItem): number | null {
  if (item.kind !== "ingredient" || item.quantity <= 0 || item.price < 0) return null;
  return item.price / item.quantity;
}

export function resolveMealCost(template: MealTemplate, environment: FoodEnvironmentItem[]): { cost: number; source: CostSource } {
  const scenes = sceneParts(template.scene);
  const externallyPrepared = scenes.some((scene) => ["公司食堂", "外卖", "外食"].includes(scene)) && !scenes.includes("便利店");

  if (externallyPrepared) {
    const exact = environment.find((item) => item.kind === "prepared-meal" && normalize(item.name) === normalize(template.title));
    if (exact) return { cost: exact.price, source: "user" };
    const sameScene = environment.filter((item) => item.kind === "prepared-meal" && item.scene && scenes.includes(item.scene));
    if (sameScene.length > 0) {
      const average = sameScene.reduce((sum, item) => sum + item.price, 0) / sameScene.length;
      return { cost: Number(average.toFixed(2)), source: "user" };
    }
    return { cost: template.estimatedCost, source: "reference" };
  }

  const requirements = structuredRequirements(template.shoppingItems);
  if (requirements.length === 0) return { cost: template.estimatedCost, source: "reference" };
  let total = 0;
  for (const requirement of requirements) {
    const item = environment.find((candidate) => candidate.kind === "ingredient"
      && normalize(candidate.name) === normalize(requirement.name)
      && candidate.unit === requirement.unit);
    const unitCost = item ? ingredientUnitCost(item) : null;
    if (unitCost === null) return { cost: template.estimatedCost, source: "reference" };
    total += unitCost * requirement.quantity;
  }
  return { cost: Number(total.toFixed(2)), source: "user" };
}
