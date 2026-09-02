import type { GeneratedWeekPlan, ShoppingItem } from "@/types";
import { structuredRequirements } from "@/lib/reality-data";

const categoryOrder = ["蛋白质", "蔬菜", "主食", "水果 / 饮品", "其他"];

function categoryForIngredient(ingredient: string): string {
  if (["鸡肉", "鸡胸肉", "牛肉", "鱼", "虾仁", "鸡蛋", "茶叶蛋", "豆腐", "无糖酸奶", "牛奶", "无糖牛奶", "无糖豆浆", "奶酪"].some((item) => ingredient.includes(item))) return "蛋白质";
  if (["蔬菜", "青菜", "生菜", "冷冻蔬菜", "冷冻混合蔬菜", "西兰花", "番茄", "蘑菇"].some((item) => ingredient.includes(item))) return "蔬菜";
  if (["大米", "米饭", "即食米饭", "燕麦", "燕麦片", "面条", "米粉", "全麦面包", "全麦三明治", "玉米"].some((item) => ingredient.includes(item))) return "主食";
  if (["苹果", "香蕉", "坚果"].some((item) => ingredient.includes(item))) return "水果 / 饮品";
  return "其他";
}

function stableId(name: string, unit: string): string {
  return `purchase-${encodeURIComponent(name.trim())}-${encodeURIComponent(unit.trim())}`;
}

function formatQuantity(quantity: number): string {
  return Number.isInteger(quantity) ? String(quantity) : String(Number(quantity.toFixed(2)));
}

export function deriveShoppingList(plan: GeneratedWeekPlan): ShoppingItem[] {
  const totals = new Map<string, { name: string; unit: string; quantity: number }>();
  for (const day of plan.days) {
    for (const meal of day.meals) {
      for (const requirement of structuredRequirements(meal.shoppingItems)) {
        const name = requirement.name.trim();
        const unit = requirement.unit.trim();
        if (!name || !unit || requirement.quantity <= 0) continue;
        const key = `${name}\u0000${unit}`;
        const current = totals.get(key);
        totals.set(key, { name, unit, quantity: (current?.quantity ?? 0) + requirement.quantity });
      }
    }
  }

  return [...totals.values()]
    .sort((left, right) => {
      const categoryDifference = categoryOrder.indexOf(categoryForIngredient(left.name)) - categoryOrder.indexOf(categoryForIngredient(right.name));
      return categoryDifference || left.name.localeCompare(right.name) || left.unit.localeCompare(right.unit);
    })
    .map(({ name, unit, quantity }) => ({
      id: stableId(name, unit),
      category: categoryForIngredient(name),
      name,
      quantity,
      unit,
      amount: `${formatQuantity(quantity)} ${unit}`,
      purchased: false,
    }));
}

export function mergeShoppingListPreservingPurchased(previousItems: ShoppingItem[], nextItems: ShoppingItem[]): ShoppingItem[] {
  const purchasedIds = new Set(previousItems.filter((item) => item.purchased).map((item) => item.id));
  const purchasedLegacy = new Set(previousItems.filter((item) => item.purchased).map((item) => `${item.name.trim()}\u0000${item.unit ?? ""}`));
  return nextItems.map((item) => ({
    ...item,
    purchased: purchasedIds.has(item.id) || purchasedLegacy.has(`${item.name.trim()}\u0000${item.unit ?? ""}`),
  }));
}
